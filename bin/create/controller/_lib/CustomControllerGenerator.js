const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const ControllerGenerator = require('@loopback/cli/generators/controller/index');
const { readFileSync, writeFileSync } = require('fs-extra');
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');
const utils = require('@loopback/cli/lib/utils');

/**
 * Subclass loopback-cli generator and apply custom logic
 */
class CustomControllerGenerator extends ControllerGenerator {
    /**
     * override the default copy template since we are using a custom one.
     * @param {*} _source the template file path. unused here, will be recalculated
     * @param {*} _dest The original destination file path. Unused here, will be recalculated.
     * @param {*} artifactInfo Source data object for current artifact
     */
    copyTemplatedFiles (_source, _dest, artifactInfo) {
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.name);
        const destpath = path.join(this.artifactInfo.outDir, kebabCaseFilename);
        if (!fs.existsSync(destpath)) {
            fs.mkdirSync(destpath, { recursive: true });
        }
        const dest = path.join(destpath, this.artifactInfo.outFile);

        // recalculate the template files
        let controllerTemplate = 'controller-template.ts.ejs';
        let specsTemplate = 'specs-template.ts.ejs';
        switch (this.artifactInfo.controllerType) {
        case ControllerGenerator.REST:
            controllerTemplate = 'controller-rest-template.ts.ejs';
            specsTemplate = 'specs-rest-template.ts.ejs';
            break;
        default:
            break;
        }
        controllerTemplate = path.join(__dirname, './templates/' + controllerTemplate);
        specsTemplate = path.join(__dirname, './templates/' + specsTemplate);

        // render the files and write them out
        const controllerTemplateContent = readFileSync(controllerTemplate).toString();
        const specsTemplateContent = readFileSync(specsTemplate).toString();
        const renderedController = ejs.render(controllerTemplateContent, artifactInfo);
        const renderedSpecs = ejs.render(specsTemplateContent, artifactInfo);
        writeFileSync(dest, renderedController);
        writeFileSync(path.join(dest, '../specs.ts'), renderedSpecs);

        // add the reference to index.ts file
        relationUtils.addExportController(this,
            path.resolve(this.artifactInfo.outDir, 'index.ts'),
            this.artifactInfo.controllerClassName,
            kebabCaseFilename + '/' + kebabCaseFilename + '.controller'
        );
    }
}
exports.CustomControllerGenerator = CustomControllerGenerator;
