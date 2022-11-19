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
exports.scanCommands = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Recursively scan the passed in directory searching for commandConfig.js files.
 *
 * @param dir The directory to be scanned
 * @param name The command name. This is an arbitrary string but it should match the directory name
 * @returns A deep json with command paths and some infos
 */
async function scanCommands(dir, name) {
    const replace = path_1.default.join(__dirname, '../');
    const files = await fs_1.default.promises.readdir(dir);
    const scanResult = [];
    // check for files in current scanned directory
    for (const fileName of files) {
        if (fileName === 'commandConfig.js') {
            scanResult.push({
                cmd: name,
                file: path_1.default.posix.join(dir, fileName).replace(replace, ''),
                children: []
            });
        }
    }
    const found = scanResult.length > 0;
    // recirsively scan subdirectories. Do not scan the ones starting with "_"
    for (const fileName of files) {
        if (!fileName.startsWith('_')) {
            const f = path_1.default.posix.join(dir, fileName);
            const stat = await fs_1.default.promises.stat(f);
            if (stat.isDirectory()) {
                const _f = await scanCommands(f, fileName);
                if (found) {
                    scanResult[0].children.push(..._f);
                }
                else {
                    scanResult.push(..._f);
                }
            }
        }
    }
    return scanResult;
}
exports.scanCommands = scanCommands;
//# sourceMappingURL=scanCommands.js.map