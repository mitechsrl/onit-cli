"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomRepositoryGenerator = void 0;
const fs_1 = require("fs");
const lodash_1 = __importDefault(require("lodash"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = require("path");
const mixinUtils_1 = require("../../_lib/mixinUtils");
const yeoman_environment_1 = __importDefault(require("yeoman-environment"));
// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RepositoryGenerator = require('@loopback/cli/generators/repository/index');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('@loopback/cli/lib/utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');
/**
 * Subclass loopback-cli model generator and apply custom logic
 */
class CustomRepositoryGenerator extends RepositoryGenerator {
    constructor() {
        super({ env: yeoman_environment_1.default.createEnv() });
    }
    presetValues(data) {
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
    copyTemplatedFiles(_source, dest, artifactInfo) {
        // render the model file and writer it out
        const template = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, './templates/repository.ts.ejs')).toString();
        const rendered = ejs_1.default.render(template, artifactInfo);
        (0, fs_1.writeFileSync)(dest, rendered);
    }
    /**
     * Ovwerwirte the promptModelId method to skip the inquirer prompt if we passed the value as parameter
     */
    async promptModelId() {
        if (!this.hasPresetValues || !this.artifactInfo.idProperty) {
            await super.promptModelId();
        }
        else {
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
    async promptModels() {
        if (!this.hasPresetValues || !this.artifactInfo.modelNameList) {
            await super.promptModels();
        }
        else {
            await this._inferRepositoryType();
        }
    }
    /**
     * overwrite the scaffold methods to perform custom checks and ask for mixins before effectively scaffolding
     */
    async _scaffold() {
        if (!this.hasPresetValues || !this.artifactInfo.mixins) {
            await this.promptMixinSelection();
        }
        // magic stuff with names...
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.modelName);
        if (!this.artifactInfo.className.toLowerCase().startsWith('onit')) {
            this.artifactInfo.className = 'Onit' + lodash_1.default.upperFirst(this.artifactInfo.className);
        }
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.className);
        this.artifactInfo.className = lodash_1.default.upperFirst(lodash_1.default.camelCase(this.artifactInfo.className));
        this.artifactInfo.classNameCapitalRepoName = lodash_1.default.snakeCase(this.artifactInfo.className).toUpperCase();
        // onit-next has different import path. Setup them
        this.artifactInfo.importPath = '@mitech/onit-next/dist';
        if ((0, fs_1.existsSync)((0, path_1.join)(process.cwd(), './src/types/onitMixin.ts'))) {
            this.artifactInfo.importPath = '..';
        }
        // call the original scaffold
        await super._scaffold();
        // add the reference to index.ts file
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.className);
        await relationUtils.addExportController(this, (0, path_1.resolve)(this.artifactInfo.outDir, 'index.ts'), this.artifactInfo.className, kebabCaseFilename + '.repository');
    }
    // Prompt the mixin selection checkboxes
    async promptMixinSelection() {
        await (0, mixinUtils_1.promptMixinSelection)(this.artifactInfo.datasourcesDir, this.artifactInfo);
    }
}
exports.CustomRepositoryGenerator = CustomRepositoryGenerator;
//# sourceMappingURL=CustomRepositoryGenerator.js.map