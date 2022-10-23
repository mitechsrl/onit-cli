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
exports.mixinFromFile = void 0;
const fs_1 = __importDefault(require("fs"));
const webpack_1 = __importDefault(require("webpack"));
/**
 * Complete the webpack config by merging the internal-generated configuration with the user-provided one.
 * The file must be placed in project top level directory with name 'webpack.config.js'.
 * NOTE: the user.provided file must export a function as default in the form of
 *
 * (previousConfig, options) => newConfig
 *
 * @param obj previous config
 * @param fileName user webpack.config.js file to be merged
 * @returns
 */
function mixinFromFile(obj, fileName) {
    if (fs_1.default.existsSync(fileName)) {
        // the file must export a function like (obj) => obj
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mixin = require(fileName);
        if (!mixin.default)
            return obj;
        return mixin.default(obj, {
            ModuleFederationPlugin: webpack_1.default,
            // export the require: this will alow mixins to require stuff from this cli
            require: require
        });
    }
    return obj;
}
exports.mixinFromFile = mixinFromFile;
//# sourceMappingURL=mixinFromFile.js.map