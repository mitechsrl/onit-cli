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
exports.searchEntryPoints = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const find_1 = __importDefault(require("find"));
/**
 * Scan the dev environment to find for webpack.json files.
 * These ones in our env keep data of entry points.
 * These data is then merged into one single bigger webpack config json
 *
 */
function searchEntryPoints(context, searchSubDirs) {
    // search in these subdirs of the provided one.
    searchSubDirs = ['./src/client', ...searchSubDirs || []];
    // search for webpack entry points: files from context/config.path/.../react/webpack.json
    const entryPoints = {};
    const regex = /[\\/]webpack\.json$/;
    const files = searchSubDirs.reduce((files, subdir) => {
        subdir = path_1.default.resolve(context, subdir);
        if (fs_1.default.existsSync(subdir)) {
            files.push(...find_1.default.fileSync(regex, subdir));
        }
        return files;
    }, []);
    files.forEach(f => {
        const file = JSON.parse(fs_1.default.readFileSync(f).toString());
        Object.keys(file.entry || {}).forEach(epKey => {
            const id = epKey;
            const name = path_1.default.resolve(path_1.default.dirname(f), file.entry[epKey]);
            entryPoints[id] = name;
        });
    });
    return entryPoints;
}
exports.searchEntryPoints = searchEntryPoints;
//# sourceMappingURL=searchEntryPoints.js.map