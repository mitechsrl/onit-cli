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
exports.CustomModelGenerator = void 0;
const fs_1 = require("fs");
const lodash_1 = __importDefault(require("lodash"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const mixinUtils_1 = require("../../lib/mixinUtils");
// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('@loopback/cli/lib/utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ModelGenerator = require('@loopback/cli/generators/model/index');
/**
 * Subclass loopback-cli model generator and apply custom logic
 */
class CustomModelGenerator extends ModelGenerator {
    // override the default copy template since we are using a custom one.
    copyTemplatedFiles(_unused, filename, artifactInfo) {
        // render the model file and writer it out
        const template = (0, fs_1.readFileSync)(path_1.default.join(__dirname, './templates/model.ts.ejs')).toString();
        const rendered = ejs_1.default.render(template, artifactInfo);
        (0, fs_1.writeFileSync)(filename, rendered);
    }
    // overwrite the last methos to ask for mixins before effectively scaffolding
    async scaffold() {
        await this.promptMixinSelection();
        // magic stuff with names...
        if (!this.artifactInfo.name.toLowerCase().startsWith('onit')) {
            this.artifactInfo.name = 'Onit' + lodash_1.default.upperFirst(this.artifactInfo.name);
        }
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
        this.artifactInfo.className = lodash_1.default.upperFirst(lodash_1.default.camelCase(this.artifactInfo.className));
        this.artifactInfo.classNameCapitalModelName = lodash_1.default.snakeCase(this.artifactInfo.className).toUpperCase();
        // onit-next has different import path
        this.artifactInfo.importPath = '@mitech/onit-next/dist';
        if ((0, fs_1.existsSync)(path_1.default.join(process.cwd(), './src/types/onitMixin.ts'))) {
            this.artifactInfo.importPath = '..';
        }
        // call the original scaffold
        await super.scaffold();
        // add the reference to index.ts file
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.className);
        await relationUtils.addExportController(this, path_1.default.resolve(this.artifactInfo.outDir, 'index.ts'), this.artifactInfo.className, kebabCaseFilename + '.model');
    }
    // Prompt the mixin selection checkboxes
    async promptMixinSelection() {
        await (0, mixinUtils_1.promptMixinSelection)(this.artifactInfo.modelDir, this.artifactInfo);
    }
}
exports.CustomModelGenerator = CustomModelGenerator;
//# sourceMappingURL=CustomModelGenerator.js.map