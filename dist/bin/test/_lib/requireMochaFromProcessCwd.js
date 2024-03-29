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
exports.requireMochaFromProcessCwd = void 0;
const logger_1 = require("../../../lib/logger");
const resolve_1 = __importDefault(require("resolve"));
const types_1 = require("../../../types");
/**
 * We relies on the local installed mocha instance to get the job done. Getting it
 * @returns
 */
function requireMochaFromProcessCwd() {
    try {
        const requirePath = resolve_1.default.sync('mocha', { basedir: process.cwd() });
        if (requirePath) {
            logger_1.logger.log('Found a mocha instance in ' + requirePath);
        }
        return require(requirePath);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND')
            throw new types_1.StringError('Cannot find a local instance of mocha. Please add the dependency @mitech/onit-dev-tools.');
        throw e;
    }
}
exports.requireMochaFromProcessCwd = requireMochaFromProcessCwd;
//# sourceMappingURL=requireMochaFromProcessCwd.js.map