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
exports.requireMochaFromProcessCwd = void 0;
const path_1 = require("path");
const logger_1 = require("../../../lib/logger");
/**
 * Search and require an instance of mocha in the target workspace
 * @returns;
 */
function requireMochaFromProcessCwd() {
    const base = process.cwd();
    let importPath = null;
    let mocha = null;
    [
        './node_modules/mocha',
        '../node_modules/mocha'
    ].find(p => {
        try {
            // console.log(path.join(base, p));
            importPath = (0, path_1.join)(base, p);
            mocha = require(importPath);
            return true;
        }
        catch (e) {
            importPath = null;
            return false;
        }
    });
    if (importPath) {
        logger_1.logger.log('Found a mocha instance in ' + importPath);
    }
    return mocha;
}
exports.requireMochaFromProcessCwd = requireMochaFromProcessCwd;
//# sourceMappingURL=requireMochaFromProcessCwd.js.map