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
exports.runWebpack = void 0;
const logger_1 = require("../../../../../lib/logger");
const buildWebpackConfig_1 = require("./buildWebpackConfig");
const searchEntryPoints_1 = require("./searchEntryPoints");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_config_1 = require("../configFiles/webpack.config");
/**
 * Webpack builder runner
 *
 * @param distFeTargetDir
 * @param onitConfigFile
 * @param buildMode
 * @param injectBuildOptions
 * @returns
 */
async function runWebpack(distFeTargetDir, onitConfigFile, buildMode, injectBuildOptions) {
    var _a;
    logger_1.logger.info('[WEBPACK] Running a webpack build with config ' + (injectBuildOptions ? JSON.stringify(injectBuildOptions) : 'standard'));
    // const originalPath = process.cwd();
    const context = process.cwd();
    // create a webpack config for the current directory and
    // add dynamic entry points to the webpack config for the current directory.
    // search all entry points for the current run directory (they are spread over in webpack.json files)
    const customPaths = onitConfigFile.json.reactPaths || onitConfigFile.json.webpackEntryPointPaths;
    const entryPoints = (0, searchEntryPoints_1.searchEntryPoints)(context, customPaths);
    // Build the webpack exports for the project at the current dir and node_modules
    const thisProjectWebpackExports = await (0, buildWebpackConfig_1.buildWebpackConfig)(context, onitConfigFile);
    // get the package json in the current directory
    const cwdPackageJson = JSON.parse(fs_1.default.readFileSync(path_1.default.join(context, 'package.json')).toString());
    // create a webpack config for the current path project
    let webpackConfig = await (0, webpack_config_1.webpackConfigFactory)(context, {
        entryPoints: entryPoints,
        buildPath: distFeTargetDir
    }, cwdPackageJson);
    // webpack build is either development or production.
    // everything non-development is translated to roduction (even out 'test' mode)
    webpackConfig.mode = (buildMode === 'production') ? 'production' : 'development';
    // merge the base webpack config with exports
    webpackConfig = lodash_1.default.mergeWith(webpackConfig, thisProjectWebpackExports, buildWebpackConfig_1.webpackMergeFn);
    // add externally-provided options if any
    if (injectBuildOptions) {
        webpackConfig = lodash_1.default.mergeWith(webpackConfig, injectBuildOptions, buildWebpackConfig_1.webpackMergeFn);
    }
    // TODO: aggiungere flag verbose per vedere piu info come questa?
    try {
        // util.promisify break some types?
        const stats = await new Promise((resolve, reject) => {
            (0, webpack_1.default)(webpackConfig, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
        });
        // do we had compile errors?
        if (stats) {
            const info = stats.toJson();
            if (stats.hasErrors()) {
                logger_1.logger.error('[WEBPACK] Compilation error');
                (_a = info.errors) === null || _a === void 0 ? void 0 : _a.forEach(e => logger_1.logger.error(e));
                throw new Error('Build aborted');
            }
        }
        console.info('[WEBPACK] Compile completed');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        // do we had internal errors?
        logger_1.logger.error('[WEBPACK] Compilation error');
        logger_1.logger.error(err.stack || err);
        if (err.details)
            logger_1.logger.error(err.details);
        throw new Error('Build aborted');
    }
    return 0;
}
exports.runWebpack = runWebpack;
//# sourceMappingURL=webpack.js.map