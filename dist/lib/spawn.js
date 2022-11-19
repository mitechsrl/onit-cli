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
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawn = void 0;
const child_process_1 = require("child_process");
const logger_1 = require("./logger");
/**
 * Process spawn helper. Proxy method to child_process.spawn to promisifize it and apply some custom logic
 *
 * @param cmd Command to be run
 * @param params Array of strings for parameters
 * @param print print command output to console. Default to true.
 * @param options SpawnOptionsWithoutStdio object. See node child_process docs
 * @returns SpawnResult object {exitCode:number, output:stirng}
 */
async function spawn(cmd, params, print, options) {
    return new Promise((resolve, reject) => {
        const proc = (0, child_process_1.spawn)(cmd, params !== null && params !== void 0 ? params : [], options);
        let _data = Buffer.from('');
        proc.stdout.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (print !== false) {
                logger_1.logger.rawLog(data.toString());
            }
        });
        proc.stderr.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (print !== false) {
                logger_1.logger.rawLog(data.toString());
            }
        });
        proc.on('close', (code) => {
            return resolve({
                exitCode: code,
                output: _data.toString()
            });
        });
        proc.on('error', (err) => {
            return reject(err);
        });
    });
}
exports.spawn = spawn;
//# sourceMappingURL=spawn.js.map