const ejs = require('ejs');
const ModelGenerator = require('@loopback/cli/generators/model/index');
const { readFileSync, writeFileSync } = require('fs-extra');
const { join, parse } = require('path');
const _ = require('lodash');
const utils = require('@loopback/cli/lib/utils');
const inquirer = require('inquirer');
const { mixinToArtifactFileName } = require('../../_lib/mixinUtils');

/**
 * Subclass loopback-cli model generator and apply custom logic
 */
class CustomModelGenerator extends ModelGenerator {
    // override the default copy template since we are using a custom one.
    copyTemplatedFiles (_unused, filename, data) {
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
exports.CustomModelGenerator = CustomModelGenerator;
