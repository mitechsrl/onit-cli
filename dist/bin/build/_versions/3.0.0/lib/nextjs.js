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
exports.nextJsBuild = void 0;
const child_process_1 = require("child_process");
const resolveNextBinImportPath_1 = require("./resolveNextBinImportPath");
const path_1 = __importDefault(require("path"));
async function nextJsBuild(onitConfigFile, cwdPackageJson, buildMode, //'prduction'|'development',
argv) {
    // we just automatize the "next build" command. Checking for binary to be launched (will throw eventually)
    const binPath = (0, resolveNextBinImportPath_1.resolveNextBinImportPath)();
    // this is the directory where the folder "pages" is places.
    // This is relative to the onit.config.js file path 
    const nextDirectory = './next';
    // calculate the real path relative to onit.config.js
    const dir = path_1.default.join(onitConfigFile.sources[0], '../');
    let nextjsDir = path_1.default.join(dir, nextDirectory);
    nextjsDir = path_1.default.relative(dir, nextjsDir);
    // binary found. Spawn it!
    return new Promise((resolve, reject) => {
        const ls = (0, child_process_1.spawn)('node', [binPath, 'build', nextjsDir], {
            env: {
                // Nextjs complain about this for these reasons: https://nextjs.org/docs/messages/non-standard-node-env
                // Ignoring them now, this command is explicitly run in dev mode
                NODE_ENV: buildMode
            },
            // ignore stdin, stdout & stderr just print out to the current cli session output 
            stdio: ['ignore', 'inherit', 'inherit']
        });
        ls.on('close', (code) => {
            if (code === 0)
                return resolve(undefined);
            reject({ info: 'Next-cli exited with error code', code: code });
        });
    });
}
exports.nextJsBuild = nextJsBuild;
//# sourceMappingURL=nextjs.js.map