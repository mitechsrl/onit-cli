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
exports.buildWebpackConfig = exports.webpackMergeFn = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const types_1 = require("../../../../../types");
const onitFileLoader_1 = require("../../../../../lib/onitFileLoader");
/**
 * Merge function for webpack config. NOTE: this function will be called by lodash mergeWith.
 * The only extra stuff this fn does is to concat arrays, other stuff is managed automatically by _.merge.
 * @param {*} dst
 * @param {*} src
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function webpackMergeFn(dst, src) {
    if (Array.isArray(dst))
        return dst.concat(src);
    return undefined;
}
exports.webpackMergeFn = webpackMergeFn;
/**
 * Create teh webpack exports config by merging all the exports from our node_modules dependencies
 *
 * @param {*} context
 * @param {*} onitConfigFile
 * @returns
 */
async function buildWebpackConfig(context, onitConfigFile) {
    const moduleName = path_1.default.basename(context);
    // get this module webpack config
    let config = lodash_1.default.get(onitConfigFile, 'json.export.webpack', {});
    const scope = '@mitech';
    // merge it with all the configs from node modules paths
    const nodeModulesPath = path_1.default.resolve(context, './node_modules/' + scope);
    let files = [];
    if (fs_1.default.existsSync(nodeModulesPath)) {
        files = await fs_1.default.promises.readdir(nodeModulesPath);
    }
    for (const file of files) {
        const dependencyModulePath = path_1.default.join(nodeModulesPath, file);
        let moduleConfig;
        try {
            moduleConfig = await (0, onitFileLoader_1.onitFileLoader)(dependencyModulePath);
            console.log('[WEBPACK] ' + moduleName + ' - trovata dipendenza ' + scope + '/' + file + ' in ' + dependencyModulePath);
            const thisModuleConfig = lodash_1.default.get(moduleConfig, 'json.export.webpack', {});
            config = lodash_1.default.mergeWith(config, thisModuleConfig, webpackMergeFn);
        }
        catch (error) {
            // if the module don't have a onitBuild file, just skip
            if (!(error instanceof types_1.NotFoundError)) {
                throw error;
            }
        }
    }
    return config;
}
exports.buildWebpackConfig = buildWebpackConfig;
//# sourceMappingURL=buildWebpackConfig.js.map