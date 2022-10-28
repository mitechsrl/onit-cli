const ejs = require('ejs');
const ModelGenerator = require('@loopback/cli/generators/model/index');
const { readFileSync, writeFileSync } = require('fs-extra');
const fs = require('fs');
const _ = require('lodash');
const utils = require('@loopback/cli/lib/utils');
const { promptMixinSelection } = require('../../_lib/mixinUtils');
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');
const path = require('path');

/**
 * Subclass loopback-cli model generator and apply custom logic
 */
class CustomModelGenerator extends ModelGenerator {
    // override the default copy template since we are using a custom one.
    copyTemplatedFiles (_unused, filename, artifactInfo) {
        // render the model file and writer it out
        const template = readFileSync(path.join(__dirname, './templates/model.ts.ejs')).toString();
        const rendered = ejs.render(template, artifactInfo);
        writeFileSync(filename, rendered);
    }

    // overwrite the last methos to ask for mixins before effectively scaffolding
    async scaffold () {
        await this.promptMixinSelection();
        // magic stuff with names...
        if (!this.artifactInfo.name.toLowerCase().startsWith('onit')) {
            this.artifactInfo.name = 'Onit' + _.upperFirst(this.artifactInfo.name);
        }
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
        this.artifactInfo.className = _.upperFirst(_.camelCase(this.artifactInfo.className));
        this.artifactInfo.classNameCapitalModelName = _.snakeCase(this.artifactInfo.className).toUpperCase();

        // onit-next has different import path
        this.artifactInfo.importPath = '@mitech/onit-next/dist';
        if (fs.existsSync(path.join(process.cwd(), './src/types/onitMixin.ts'))) {
            this.artifactInfo.importPath = '..';
        }

        // call the original scaffold
        await super.scaffold();

        // add the reference to index.ts file
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.className);
        await relationUtils.addExportController(
            this,
            path.resolve(this.artifactInfo.outDir, 'index.ts'),
            this.artifactInfo.className,
            kebabCaseFilename + '.model'
        );
    }

    // Prompt the mixin selection checkboxes
    async promptMixinSelection () {
        await promptMixinSelection(this.artifactInfo.modelDir, this.artifactInfo);
    }
}
exports.CustomModelGenerator = CustomModelGenerator;
