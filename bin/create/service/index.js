/*
Copyright (c) 2021 Mitech S.R.L.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

const ejs = require('ejs');
const path = require('path');
const ServiceGenerator = require('@loopback/cli/generators/service/index');
const { readFileSync, writeFileSync } = require('fs-extra');
const { join, parse } = require('path');

/**
 * Subclass loopback-cli model generator and apply custom logic
 */
class CustomServiceGenerator extends ServiceGenerator {
    // override the default copy template since we are using a custom one.
    copyTemplatedFiles (_unused, filename, data) {
        // render the model file and writer it out
        const template = readFileSync(this.artifactInfo.defaultTemplate).toString();
        const rendered = ejs.render(template, data);
        writeFileSync(filename, rendered);

        // add the reference to index.ts file
        const indexTsFilename = join(filename, '../index.ts');
        const filenameWithoutExt = parse(filename).name;
        let indexTsContent = readFileSync(indexTsFilename).toString();
        indexTsContent += `\nexport * from './${filenameWithoutExt}';`;
        writeFileSync(indexTsFilename, indexTsContent);
    }

    // overwrite the last methos to ask for mixins before effectively scaffolding
    async scaffold () {
        // change directory polinters
        const REMOTE_SERVICE_TEMPLATE = path.join(__dirname, './_lib/templates/remote-service-proxy-template.ts.ejs');
        const LOCAL_CLASS_TEMPLATE = path.join(__dirname, './_lib/templates/local-service-class-template.ts.ejs');
        const LOCAL_PROVIDER_TEMPLATE = path.join(__dirname, '../_lib/templates/local-service-provider-template.ts.ejs');
        const TEMPLATES = {
            proxy: REMOTE_SERVICE_TEMPLATE,
            class: LOCAL_CLASS_TEMPLATE,
            provider: LOCAL_PROVIDER_TEMPLATE
        };

        this.artifactInfo.defaultTemplate = TEMPLATES[this.artifactInfo.serviceType];

        return super.scaffold();
    }
}

module.exports.info = 'Create a service';
module.exports.help = [
    'Interctive service creation tool. This tool must be run into a onit-based app directory'
];

module.exports.cmd = async function (basepath, params) {
    const generator = new CustomServiceGenerator();

    // NOTE: the orignal class methods were run with yeoman.
    // Yeoman runs sequentially the class mehods. Imitating it with this code.
    for (const method of Object.getOwnPropertyNames(ServiceGenerator.prototype)) {
        // NOTE1: skipping checkLoopBackProject to avoid dependency checks. We just need to create the model file
        // NOTE2: skipping methods starting with _. Those are private.
        if (['constructor', 'checkLoopBackProject'].includes(method) || method.startsWith('_')) continue;

        await generator[method]();
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
};
