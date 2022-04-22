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

const _ = require('lodash');
const webpackUtils = require('../../../../../lib/webpack/utils');
const webpackWatcher = require('./webpackWatcher');
const { searchEntryPoints } = require('../../../../../shared/2.0.0/lib/searchEntryPoints');

module.exports.start = async (onitConfigFile, cwdPackageJson, params) => {
    // load the default config
    const webpackConfigFactory = require('../configFiles/webpack.config');

    // search all entry points for the current run directory (they are spread over in webpack.json files)
    const customPaths = onitConfigFile.json.reactPaths || onitConfigFile.json.webpackEntryPointPaths;
    const entryPoints = searchEntryPoints(process.cwd(), customPaths);

    // Build the webpack exports for the project at the current dir and node_modules
    const thisProjectWebpackExports = await webpackUtils.buildWebpackConfig(process.cwd(), onitConfigFile);

    // create a webpack config for the current path project
    let webpackConfig = webpackConfigFactory(process.cwd(), {
        entryPoints: entryPoints,
        minimize: params.get('-minimize').found,
        production: params.get('-prod').found,
        outputPath: _.get(onitConfigFile, 'json.webpack.outputPath', './dist-fe')
    }, cwdPackageJson);

    // merge the base webpack config with exports
    webpackConfig = _.mergeWith(webpackConfig, thisProjectWebpackExports, webpackUtils.webpackMergeFn);

    // generate a webpack watcher instance and run it
    return webpackWatcher(webpackConfig, params);
};
