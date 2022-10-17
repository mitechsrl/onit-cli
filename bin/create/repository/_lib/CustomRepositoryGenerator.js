const ejs = require('ejs');
const RepositoryGenerator = require('@loopback/cli/generators/repository/index');
const { readFileSync, writeFileSync } = require('fs-extra');
const { join, parse, resolve } = require('path');
const _ = require('lodash');
const utils = require('@loopback/cli/lib/utils');
const inquirer = require('inquirer');
const { mixinToArtifactFileName } = require('../../_lib/mixinUtils');
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');

/**
 * Subclass loopback-cli model generator and apply custom logic
 */
class CustomRepositoryGenerator extends RepositoryGenerator {
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

    // overwrite the last methos to ask for mixins before effectively scaffolding
    async _scaffold () {
        await this.promptMixinSelection();

        // magic stuff with names...
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.modelName);
        if (!this.artifactInfo.className.toLowerCase().startsWith('onit')) {
            this.artifactInfo.className = 'Onit' + _.upperFirst(this.artifactInfo.className);
        }
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.className);
        this.artifactInfo.className = _.upperFirst(_.camelCase(this.artifactInfo.className));
        this.artifactInfo.classNameCapitalRepoName = _.snakeCase(this.artifactInfo.className).toUpperCase();

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
        const mixinsDir = join(this.artifactInfo.datasourcesDir, '../mixins');
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
exports.CustomRepositoryGenerator = CustomRepositoryGenerator;
