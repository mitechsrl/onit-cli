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
exports.runBuild = void 0;
const logger_1 = require("../../../../../lib/logger");
const clean_1 = require("./clean");
const tsc_1 = require("./tsc");
const webpack_1 = require("./webpack");
/**
 * Main build runner method. This entry point call all he others needed mthod
 *
 * @param cwdPackageJson Package.json at rocess.cwd path
 * @param buildTarget Build target config
 * @param onitConfigFile The config file content
 *
 */
async function runBuild(cwdPackageJson, buildTarget, onitConfigFile) {
    // Do a production build as default
    var _a;
    let buildMode = '';
    if (['production', 'uat'].includes((_a = buildTarget.mode) !== null && _a !== void 0 ? _a : '')) {
        buildMode = 'production';
    }
    else {
        buildMode = 'development';
    }
    logger_1.logger.log(`:hammer: Running build in ${buildMode} mode`);
    // clean the build directory
    await (0, clean_1.runClean)(onitConfigFile, cwdPackageJson);
    // launch webpack build
    await (0, webpack_1.runWebpack)('./dist-fe', onitConfigFile, buildMode);
    // launch typescript build
    await (0, tsc_1.runTsc)(onitConfigFile, cwdPackageJson);
    logger_1.logger.info(':muscle: Build completed');
    return {};
}
exports.runBuild = runBuild;
//# sourceMappingURL=build.js.map