const ejs = require('ejs');
const ModelGenerator = require('@loopback/cli/generators/model/index');
const { readFileSync, writeFileSync } = require('fs-extra');
const { join, resolve } = require('path');
const fs = require('fs');
const _ = require('lodash');
const utils = require('@loopback/cli/lib/utils');
const inquirer = require('inquirer');
const { mixinToArtifactFileName } = require('../../_lib/mixinUtils');
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');
const path = require('path');

/**
 * Subclass loopback-cli model generator and apply custom logic
 */
class CustomModelGenerator extends ModelGenerator {
    // override the default copy template since we are using a custom one.
    copyTemplatedFiles (_unused, filename, artifactInfo) {
        // render the model file and writer it out
        const template = readFileSync(join(__dirname, './templates/model.ts.ejs')).toString();
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
        this.artifactInfo.importPath = '@mitech/oni-next/dist';
        if (fs.existsSync(path.join(process.cwd(), './src/types/onitMixin.ts'))) {
            this.artifactInfo.importPath = '..';
        }

        // call the original scaffold
        await super.scaffold();

        // add the reference to index.ts file
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.className);
        await relationUtils.addExportController(
            this,
            resolve(this.artifactInfo.outDir, 'index.ts'),
            this.artifactInfo.className,
            kebabCaseFilename + '.model'
        );
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
exports.CustomModelGenerator = CustomModelGenerator;
