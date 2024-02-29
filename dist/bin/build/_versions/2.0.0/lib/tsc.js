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
exports.runTsc = void 0;
const logger_1 = require("../../../../../lib/logger");
const npm_1 = require("../../../../../lib/npm");
const spawn_1 = require("../../../../../lib/spawn");
const copyExtraFiles_1 = require("./copyExtraFiles");
async function runTsc(onitConfigFile, cwdPackageJson) {
    logger_1.logger.log('[TSC] Starting tsc build...');
    // run the user build script if any, otherwise just run the loopback tsc compiler (which btw is
    // the default implementation of 'npm run build' for loopback 4 projects)
    let r = null;
    if (typeof (cwdPackageJson.scripts || {}).build === 'string') {
        r = await (0, spawn_1.spawn)(npm_1.npmExecutable, ['run', 'build'], { shell: true });
    }
    else {
        r = await (0, spawn_1.spawn)(npm_1.npxExecutable, ['lb-tsc'], { shell: true });
    }
    // TODO: verificare se cambia qualcosa da powershell ad altre shells
    if (r.exitCode !== 0) {
        throw new Error('Build failed');
    }
    // tsc does not manage other files. Just copy them by ourselves
    const fileCopy = await (0, copyExtraFiles_1.copyExtraFiles)(onitConfigFile);
    await new Promise(resolve => {
        fileCopy.start(() => {
            fileCopy.close();
            resolve(null);
        });
    });
    logger_1.logger.info('[TSC] Tsc build completed!');
}
exports.runTsc = runTsc;
//# sourceMappingURL=tsc.js.map