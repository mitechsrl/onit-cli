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
exports.scanLabelsFiles = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const util_1 = require("util");
// This lib does not have typescript typings
// eslint-disable-next-line @typescript-eslint/no-var-requires
const globAll = require('glob-all');
/**
 * Scan for label files in the specified directory
 *
 * @param dir search in this directory (recursively)
 * @returns
 */
async function scanLabelsFiles(dir) {
    // search for json files
    const options = {
        cwd: dir,
        ignore: [
            './**/node_modules/**/*',
            './**/package.json',
            './**/tsconfig.json'
        ]
    };
    let files = await (0, util_1.promisify)(globAll)(['./**/*.json'], options);
    // make sure we have absolute paths
    files = files.map(f => (0, path_1.resolve)(dir, f));
    files.sort();
    return files.map(filename => {
        const json = JSON.parse(fs_1.default.readFileSync(filename).toString());
        if (!json.labels) {
            // Not a labels file. Skip;
            return null;
        }
        if (!Array.isArray(json.labels)) {
            return null;
        }
        return {
            filename: filename,
            content: json
        };
    }).filter(l => !!l);
}
exports.scanLabelsFiles = scanLabelsFiles;
//# sourceMappingURL=scanLabelsFiles.js.map