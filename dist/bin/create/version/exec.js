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
const types_1 = require("../../../types");
const path_1 = require("path");
const fs_1 = require("fs");
const inquirer_1 = __importDefault(require("inquirer"));
const ejs_1 = __importDefault(require("ejs"));
const logger_1 = require("../../../lib/logger");
const exec = async (argv) => {
    const packageJsonPath = (0, path_1.join)(process.cwd(), './package.json');
    const versionsFilePath = (0, path_1.join)(process.cwd(), './src/boot/versions.ts');
    if (!(0, fs_1.existsSync)(packageJsonPath)) {
        throw new Error('package.json not found in current directory');
    }
    if (!(0, fs_1.existsSync)(versionsFilePath)) {
        throw new Error('File ./src/boot/versions.ts not found. Please run this command in a valid onit-based project directory');
    }
    // IV: The correct way to change the file is by using typescript compiler API, but it's quite long and complex.
    // Doing it using a way too much dumber processing for now.
    let fileContent = (0, fs_1.readFileSync)(versionsFilePath, 'utf8').toString();
    const regex = /assertDbInitVersions\([ \n\t]*{([^}]+)}[ \n\t]*\)/gs;
    const matched = regex.exec(fileContent);
    if (!matched)
        throw new types_1.StringError('Couldn\'t find the assertDbInitVersions function in the file');
    const functionParamContent = matched[1];
    // indentation
    const indentation = functionParamContent.trimEnd().replace(functionParamContent.trim(), '').replace('\n', '');
    // calculate next version
    const versionMatchRegex = /['"]([0-9]+)\.([0-9]+)\.([0-9a-fA-F]+)['"]([^\n]+)/g;
    let v;
    const versions = [];
    while (null != (v = versionMatchRegex.exec(functionParamContent))) {
        versions.push({ a: v[1], b: v[2], c: v[3], rest: v[4] });
    }
    versions.sort((a, b) => {
        const _a = a.a.padStart(6, '0') + a.b.padStart(6, '0') + a.c;
        const _b = b.a.padStart(6, '0') + b.b.padStart(6, '0') + b.c;
        return _a === _b ? 0 : _a < _b ? 1 : -1;
    });
    const lastVersion = versions[0];
    const newVersion = {
        a: lastVersion.a,
        b: (parseInt(lastVersion.b) + 1).toString(),
        c: new Date().getTime().toString(16),
        rest: `: 'Version generated at ${new Date().toISOString()} via <onit create version> command'`
    };
    versions.unshift(newVersion);
    versions.reverse();
    // Get the text to be placed in function call
    const newFunctionParamContent = versions.map(v => `${indentation}'${v.a}.${v.b}.${v.c}'${v.rest}`)
        .map(v => v.endsWith(',') ? v : (v + ','))
        .join('\n');
    fileContent = fileContent.replace(functionParamContent, '\n' + newFunctionParamContent + '\n');
    (0, fs_1.writeFileSync)(versionsFilePath, fileContent);
    logger_1.logger.log(`Generated version ${newVersion.a}.${newVersion.b}.${newVersion.c}`);
    // ask for update file generation
    const answers = await inquirer_1.default.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: 'Generate update file for the new version?'
        }]);
    if (!answers.confirm)
        return;
    // render the model file and writer it out
    const template = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, './_templates/update.ejs')).toString();
    const versionString = `${newVersion.a}.${newVersion.b}.${newVersion.c}`;
    const updateFilePath = (0, path_1.join)(process.cwd(), './src/boot/updates');
    const updateFilename = 'update_' + versionString + '.ts';
    (0, fs_1.mkdirSync)(updateFilePath, { recursive: true });
    const rendered = ejs_1.default.render(template, { version: versionString });
    (0, fs_1.writeFileSync)((0, path_1.join)(updateFilePath, updateFilename), rendered);
    logger_1.logger.log(`Update file ./src/boot/updates/${updateFilename} generated`);
};
exports.default = exec;
//# sourceMappingURL=exec.js.map