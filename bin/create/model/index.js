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
const ModelGenerator = require('@loopback/cli/generators/model/index');
const { readFileSync, writeFileSync } = require('fs-extra');
const { join, parse } = require('path');
const _ = require('lodash');
const utils = require('@loopback/cli/lib/utils');
const inquirer = require('inquirer');
const { mixinToArtifactFileName } = require('../_lib/mixinUtils');

/**
 * Subclass loopback-cli model generator and apply custom logic
 */
class CustomModelGenerator extends ModelGenerator {
    // override the default copy template since we are using a custom one.
    copyTemplatedFiles (_unused, filename, data) {
        console.log(data);
        // magic stuff with names...
        if (!data.className.toLowerCase().startsWith('onit')) {
            data.className = 'Onit' + _.upperFirst(data.className);
        }
        data.className = _.upperFirst(_.camelCase(data.className));
        data.classNameCapitalModelName = _.snakeCase(data.className).toUpperCase();

        // render the model file and writer it out
        const template = readFileSync(join(__dirname, './_lib/templates/model.ts.ejs')).toString();
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
        await this.promptMixinSelection();
        return super.scaffold();
    }

    // Prompt the mixin selection checkboxes
    async promptMixinSelection () {
        const mixinsDir = join(this.artifactInfo.modelDir, '../mixins');
        const mixinNames = await utils.getArtifactList(
            mixinsDir,
            'mixin',
            true
        );

        this.artifactInfo.mixins = (await inquirer.prompt({
            type: 'checkbox',
            name: 'mixins',
            message: 'Select mixins',
            choices: mixinNames
        })).mixins.map(m => {
            return { filename: '../mixins/' + mixinToArtifactFileName(m), mixinName: _.camelCase(m) };
        });
    }
}

module.exports.info = 'Create a model';
module.exports.help = [
    'Interctive model creation tool. This tool must be runinto a onit-based app directory'
];

module.exports.cmd = async function (basepath, params) {
    const modelGenerator = new CustomModelGenerator();

    // NOTE: the orignal class methods were run with yeoman.
    // Yeoman runs sequentially the class mehods. Imitating it with this code.
    for (const method of Object.getOwnPropertyNames(ModelGenerator.prototype)) {
        // NOTE1: skipping checkLoopBackProject to avoid dependency checks. We just need to create the model file
        // NOTE2: skipping methods starting with _. Those are private.
        if (['constructor', 'checkLoopBackProject'].includes(method) || method.startsWith('_')) continue;

        await modelGenerator[method]();
    }
};
