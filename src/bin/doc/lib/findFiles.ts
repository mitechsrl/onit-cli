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


import path from 'path';
import { OnitDocumentationConfigFileJson } from '../../../types';

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
export function findFiles(config: OnitDocumentationConfigFileJson, cwd = process.cwd()): Promise<{ file:string, parser:string }[]> {
    const options = {
        ignore: [
            './node_modules/**/*',
            ...(config.ignore || [])
        ],
        cwd: cwd
    };

    // setup which files must be parsed and the relative parser. See https://en.wikipedia.org/wiki/Glob_(programming) for glob patterns
    const globList = [
        // { extension: '.js', glob: ['./**/*.js', './**/*.JS'], parser: path.join(__dirname, './parsers/javascript.js') },
        { extension: '.ts', glob: ['./**/*.ts', './**/*.TS'], parser: 'typescript' },
        { extension: '.jsx', glob: ['./**/*.jsx', './**/*.JSX'], parser: 'jsx-javascript' },
        { extension: '.md', glob: ['./**/*.md', './**/*.MD'], parser: 'markdown' },
        ...(config.globList || []) // add globs from config file
    ];

    // create a unique glob list for the glob package
    const _globList = globList.filter(g => g.glob) // skip empty globs for.... reasons
        .reduce((a, g) => {
            a.push(...(Array.isArray(g.glob) ? g.glob : [g.glob]));
            return a;
        }, [] as string[]);

    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        globAll(_globList, options, function (err:any, files: string[]) {
            if (err) { return reject(err); }
            const result = files.map(f => {
                return {
                    file: path.resolve(cwd, f),
                    parser: (globList.find(l => f.toLowerCase().endsWith(l.extension.toLowerCase())) || {}).parser ?? 'unknown'
                };
            });

            resolve(result);
        });
    });
}

