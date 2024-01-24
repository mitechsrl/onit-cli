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
exports.CustomControllerGenerator = void 0;
const fs_1 = require("fs");
const ejs_1 = __importDefault(require("ejs"));
const path_1 = require("path");
const yeoman_environment_1 = __importDefault(require("yeoman-environment"));
// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ControllerGenerator = require('@loopback/cli/generators/controller/index');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('@loopback/cli/lib/utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');
/**
 * Subclass loopback-cli generator and apply custom logic
 */
class CustomControllerGenerator extends ControllerGenerator {
    constructor() {
        super({ env: yeoman_environment_1.default.createEnv() });
    }
    /**
     * override the default copy template since we are using a custom one.
     * @param {*} _source the template file path. unused here, will be recalculated
     * @param {*} _dest The original destination file path. Unused here, will be recalculated.
     * @param {*} artifactInfo Source data object for current artifact
     */
    copyTemplatedFiles(_source, _dest, artifactInfo) {
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.name);
        const destpath = (0, path_1.join)(this.artifactInfo.outDir, kebabCaseFilename);
        if (!(0, fs_1.existsSync)(destpath)) {
            (0, fs_1.mkdirSync)(destpath, { recursive: true });
        }
        const dest = (0, path_1.join)(destpath, this.artifactInfo.outFile);
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
        controllerTemplate = (0, path_1.join)(__dirname, './templates/' + controllerTemplate);
        specsTemplate = (0, path_1.join)(__dirname, './templates/' + specsTemplate);
        // onit-next has different import path
        artifactInfo.importPath = '@mitech/onit-next/dist';
        if ((0, fs_1.existsSync)((0, path_1.join)(process.cwd(), './src/types/onitMixin.ts'))) {
            artifactInfo.importPath = '../..';
        }
        // render the files and write them out
        const controllerTemplateContent = (0, fs_1.readFileSync)(controllerTemplate).toString();
        const specsTemplateContent = (0, fs_1.readFileSync)(specsTemplate).toString();
        const renderedController = ejs_1.default.render(controllerTemplateContent, artifactInfo);
        const renderedSpecs = ejs_1.default.render(specsTemplateContent, artifactInfo);
        (0, fs_1.writeFileSync)(dest, renderedController);
        (0, fs_1.writeFileSync)((0, path_1.join)(dest, '../specs.ts'), renderedSpecs);
        // add the reference to index.ts file
        relationUtils.addExportController(this, (0, path_1.resolve)(this.artifactInfo.outDir, 'index.ts'), this.artifactInfo.controllerClassName, kebabCaseFilename + '/' + kebabCaseFilename + '.controller');
    }
}
exports.CustomControllerGenerator = CustomControllerGenerator;
//# sourceMappingURL=CustomControllerGenerator.js.map