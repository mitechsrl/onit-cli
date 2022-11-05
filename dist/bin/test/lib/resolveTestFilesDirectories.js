"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTestFilesDirectories = void 0;
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
// no typings for this lib
// eslint-disable-next-line @typescript-eslint/no-var-requires
const globAll = require('glob-all');
const path_1 = __importDefault(require("path"));
/**
 * Scan directories for test cases files. Directory match can be inglob syntax
 *
 * @param {*} testTarget
 * @return A promise which resolves with the files list
 */
async function resolveTestFilesDirectories(testTarget) {
    return new Promise((resolve, reject) => {
        globAll(testTarget.testFilesDirectories, {}, function (error, files) {
            if (error) {
                return reject(error);
            }
            files = files
                .filter(f => f.endsWith('.js'))
                .map(f => path_1.default.resolve(process.cwd(), f));
            resolve(files);
        });
    });
}
exports.resolveTestFilesDirectories = resolveTestFilesDirectories;
//# sourceMappingURL=resolveTestFilesDirectories.js.map