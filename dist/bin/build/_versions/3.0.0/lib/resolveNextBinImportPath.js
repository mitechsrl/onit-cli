"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNextBinImportPath = void 0;
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
const path_1 = __importDefault(require("path"));
const types_1 = require("../../../../../types");
const resolve_1 = __importDefault(require("resolve"));
const lodash_1 = __importDefault(require("lodash"));
/**
 * Get the next bin path
 * @returns
 */
function resolveNextBinImportPath() {
    // Cheat on the "main" path by setting it with the bin path. 
    // Resolve will retrn that value instead of mail.
    function packageFilter(pkg, dir) {
        const nextBinPath = lodash_1.default.get(pkg, 'bin.next', undefined);
        if (!nextBinPath)
            throw new types_1.StringError('No next-cli bin found');
        pkg.main = path_1.default.join(dir, nextBinPath);
        return pkg;
    }
    try {
        return resolve_1.default.sync('next', { packageFilter: packageFilter, basedir: process.cwd() });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        console.log(e);
        if (e.code === 'MODULE_NOT_FOUND')
            throw new types_1.StringError('Nextjs package not found. Make sure to have it installed as dependency');
        throw e;
    }
}
exports.resolveNextBinImportPath = resolveNextBinImportPath;
//# sourceMappingURL=resolveNextBinImportPath.js.map