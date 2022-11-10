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
exports.findFiles = void 0;
const path_1 = __importDefault(require("path"));
// This lib does not have typescript typings
// eslint-disable-next-line @typescript-eslint/no-var-requires
const globAll = require('glob-all');
/**
 * Find all files with glob.
 *
 * @param {*} config
 * @param {*} cwd
 * @returns Array of {file: string, parser:string} objects.
 * parser is the name of theparser expected to be used to process the file
 * file is the absolute path of the file to be prrocessed
 */
function findFiles(config, cwd = process.cwd()) {
    const options = {
        ignore: [
            './node_modules/**/*',
            './dist/**/*',
            './dist-fe/**/*',
            ...(config.ignore || [])
        ],
        cwd: cwd
    };
    // setup which files must be parsed and the relative parser. See https://en.wikipedia.org/wiki/Glob_(programming) for glob patterns
    const globList = [
        // { extension: '.js', glob: ['./**/*.js', './**/*.JS'], parser: path.join(__dirname, './parsers/javascript.js') },
        { extension: '.ts', glob: ['./**/*.ts', './**/*.TS'], parser: 'typescript' },
        // { extension: '.jsx', glob: ['./**/*.jsx', './**/*.JSX'], parser: path.join(__dirname, './parsers/javascript.js') },
        { extension: '.md', glob: ['./**/*.md', './**/*.MD'], parser: 'markdown' },
        ...(config.globList || []) // add globs from config file
    ];
    // create a unique glob list for the glob package
    const _globList = globList.filter(g => g.glob) // skip empty globs for.... reasons
        .reduce((a, g) => {
        a.push(...(Array.isArray(g.glob) ? g.glob : [g.glob]));
        return a;
    }, []);
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        globAll(_globList, options, function (err, files) {
            if (err) {
                return reject(err);
            }
            const result = files.map(f => {
                var _a;
                return {
                    file: path_1.default.resolve(cwd, f),
                    parser: (_a = (globList.find(l => f.toLowerCase().endsWith(l.extension.toLowerCase())) || {}).parser) !== null && _a !== void 0 ? _a : 'unknown'
                };
            });
            resolve(result);
        });
    });
}
exports.findFiles = findFiles;
//# sourceMappingURL=findFiles.js.map