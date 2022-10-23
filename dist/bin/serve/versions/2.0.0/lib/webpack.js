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
exports.webpackDevBuildAndWatch = void 0;
const lodash_1 = __importDefault(require("lodash"));
const webpack_config_1 = require("../configFiles/webpack.config");
const buildWebpackConfig_1 = require("./buildWebpackConfig");
const searchEntryPoints_1 = require("./searchEntryPoints");
const webpackWatcher_1 = require("./webpackWatcher");
/**
 * Launch a webpack build & watch. Resolve when the user trigger SIGINT (since this is a cli,
 * the user acan stop it by pressing ctrl+c)
 *
 * @param onitConfigFile
 * @param cwdPackageJson
 * @param argv
 * @returns
 */
async function webpackDevBuildAndWatch(onitConfigFile, cwdPackageJson, argv) {
    // search all entry points for the current run directory (they are spread over in webpack.json files)
    const customPaths = onitConfigFile.json.reactPaths || onitConfigFile.json.webpackEntryPointPaths;
    const entryPoints = (0, searchEntryPoints_1.searchEntryPoints)(process.cwd(), customPaths);
    // Build the webpack exports for the project at the current dir and node_modules
    const thisProjectWebpackExports = await (0, buildWebpackConfig_1.buildWebpackConfig)(process.cwd(), onitConfigFile);
    // create a webpack config for the current path project
    let webpackConfig = (0, webpack_config_1.webpackConfigFactory)(process.cwd(), {
        entryPoints: entryPoints,
        minimize: argv.minimize,
        production: argv.prod,
        outputPath: lodash_1.default.get(onitConfigFile, 'json.webpack.outputPath', './dist-fe')
    }, cwdPackageJson);
    // merge the base webpack config with exports
    webpackConfig = lodash_1.default.mergeWith(webpackConfig, thisProjectWebpackExports, buildWebpackConfig_1.webpackMergeFn);
    // generate a webpack watcher instance and run it
    return (0, webpackWatcher_1.webpackWatcher)(webpackConfig, argv);
}
exports.webpackDevBuildAndWatch = webpackDevBuildAndWatch;
//# sourceMappingURL=webpack.js.map