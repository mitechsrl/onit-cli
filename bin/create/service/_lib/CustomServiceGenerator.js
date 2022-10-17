const ejs = require('ejs');
const path = require('path');
const ServiceGenerator = require('@loopback/cli/generators/service/index');
const { readFileSync, writeFileSync } = require('fs-extra');
const { join, parse, resolve } = require('path');
const utils = require('@loopback/cli/lib/utils');
const _ = require('lodash');
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');

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
    }

    // overwrite the last methos to ask for mixins before effectively scaffolding
    async scaffold () {
        // change directory polinters
        const REMOTE_SERVICE_TEMPLATE = path.join(__dirname, './templates/remote-service-proxy-template.ts.ejs');
        const LOCAL_CLASS_TEMPLATE = path.join(__dirname, './templates/local-service-class-template.ts.ejs');
        const LOCAL_PROVIDER_TEMPLATE = path.join(__dirname, '../templates/local-service-provider-template.ts.ejs');
        const TEMPLATES = {
            proxy: REMOTE_SERVICE_TEMPLATE,
            class: LOCAL_CLASS_TEMPLATE,
            provider: LOCAL_PROVIDER_TEMPLATE
        };

        this.artifactInfo.defaultTemplate = TEMPLATES[this.artifactInfo.serviceType];

        // magic stuff with names...
        if (!this.artifactInfo.name.toLowerCase().startsWith('onit')) {
            this.artifactInfo.name = 'Onit' + _.upperFirst(this.artifactInfo.name);
        }
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
        this.artifactInfo.className = _.upperFirst(_.camelCase(this.artifactInfo.className));
        this.artifactInfo.classNameCapitalServiceName = _.snakeCase(this.artifactInfo.className).toUpperCase();

        await super.scaffold();

        // add the reference to index.ts file
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.className);
        await relationUtils.addExportController(
            this,
            resolve(this.artifactInfo.outDir, 'index.ts'),
            this.artifactInfo.className,
            kebabCaseFilename + '.service'
        );
    }
}
exports.CustomServiceGenerator = CustomServiceGenerator;
