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
exports.CustomServiceGenerator = CustomServiceGenerator;
