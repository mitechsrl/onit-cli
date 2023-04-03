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
exports.scanLabals = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
async function scanLabals(filename) {
    let labels = [];
    let files = [];
    const stat = fs_1.default.statSync(filename);
    if (stat.isDirectory()) {
        files = await (0, glob_1.glob)('./**/*.*', { cwd: filename });
        files = files.map(_f => path_1.default.join(filename, _f));
    }
    else {
        files.push(filename);
    }
    files.forEach(f => {
        const stat = fs_1.default.statSync(f);
        if (stat.isDirectory())
            return;
        const fileContent = fs_1.default.readFileSync(f).toString();
        // const regex = /i18n\(([^\)]+)\)/g;
        const regex = /i18n\(([^)]+)\)/g;
        let m;
        while ((m = regex.exec(fileContent)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                // console.log(`Found match, group ${groupIndex}: ${match}`);
                if (groupIndex > 0) {
                    labels.push({
                        language: 'it_IT',
                        label: match.replace(/'/g, '').replace(/"/g, ''),
                        text: match.replace(/'/g, '').replace(/"/g, ''),
                        page: 'CHANGE_ME'
                    });
                }
            });
        }
    });
    labels = labels.filter(function (item1, pos) {
        return labels.findIndex(item2 => item1.label === item2.label) === pos;
    });
    console.log(JSON.stringify(labels, null, 4));
}
exports.scanLabals = scanLabals;
//# sourceMappingURL=extract.js.map