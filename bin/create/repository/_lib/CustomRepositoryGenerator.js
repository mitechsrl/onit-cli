const ejs = require('ejs');
const RepositoryGenerator = require('@loopback/cli/generators/repository/index');
const { readFileSync, writeFileSync } = require('fs-extra');
const { join, resolve } = require('path');
const _ = require('lodash');
const utils = require('@loopback/cli/lib/utils');
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');
const { promptMixinSelection } = require('../../_lib/mixinUtils');
const fs = require('fs');
/**
 * Subclass loopback-cli model generator and apply custom logic
 */
class CustomRepositoryGenerator extends RepositoryGenerator {
    presetValues (data) {
        this.hasPresetValues = true;
        Object.assign(this.artifactInfo, data);

        // mixins: [list of mixins]
        // modelNameList: [ 'OmcCertificateDocument' ]
    }

    /**
     * override the default copy template since we are using a custom one.
     * @param {*} _source Source template path
     * @param {*} dest destination file path
     * @param {*} artifactInfo Source data object for current artifact
     */
    copyTemplatedFiles (_source, dest, artifactInfo) {
        // render the model file and writer it out
        const template = readFileSync(join(__dirname, './templates/repository.ts.ejs')).toString();
        const rendered = ejs.render(template, artifactInfo);
        writeFileSync(dest, rendered);
    }

    /**
     * Ovwerwirte the promptModelId method to skip the inquirer prompt if we passed the value as parameter
     */
    async promptModelId () {
        if (!this.hasPresetValues || !this.artifactInfo.idProperty) {
            await super.promptModelId();
        } else {
            // promptModelId() was calling _scaffold() internally for each model
            // if we don't call promptModelId(), we must call _scaffold by ourself
            for (const m of this.artifactInfo.modelNameList) {
                this.artifactInfo.modelName = m;
                await this._scaffold();
            }
        }
    }

    /**
     *
     */
    async promptModels () {
        if (!this.hasPresetValues || !this.artifactInfo.modelNameList) {
            await super.promptModels();
        } else {
            await this._inferRepositoryType();
        }
    }

    /**
     * overwrite the scaffold methods to perform custom checks and ask for mixins before effectively scaffolding
     */
    async _scaffold () {
        if (!this.hasPresetValues || !this.artifactInfo.mixins) {
            await this.promptMixinSelection();
        }

        // magic stuff with names...
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.modelName);
        if (!this.artifactInfo.className.toLowerCase().startsWith('onit')) {
            this.artifactInfo.className = 'Onit' + _.upperFirst(this.artifactInfo.className);
        }
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.className);
        this.artifactInfo.className = _.upperFirst(_.camelCase(this.artifactInfo.className));
        this.artifactInfo.classNameCapitalRepoName = _.snakeCase(this.artifactInfo.className).toUpperCase();

        // onit-next has different import path. Setup them
        this.artifactInfo.importPath = '@mitech/onit-next/dist';
        if (fs.existsSync(join(process.cwd(), './src/types/onitMixin.ts'))) {
            this.artifactInfo.importPath = '..';
        }

        // call the original scaffold
        await super._scaffold();

        // add the reference to index.ts file
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.className);
        await relationUtils.addExportController(
            this,
            resolve(this.artifactInfo.outDir, 'index.ts'),
            this.artifactInfo.className,
            kebabCaseFilename + '.repository'
        );
    }

    // Prompt the mixin selection checkboxes
    async promptMixinSelection () {
        await promptMixinSelection(this.artifactInfo.datasourcesDir, this.artifactInfo);
    }
}
exports.CustomRepositoryGenerator = CustomRepositoryGenerator;