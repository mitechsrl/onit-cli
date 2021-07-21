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

const path = require('path');
const _ = require('lodash');
const webpackUtils = require('../../../../../lib/webpack/utils');
const fs = require('fs');
const webpackWatcher = require('./webpackWatcher');

module.exports.start = async (logger, onitConfigFile) => {
    // load the default config
    const webpackConfigFactory = require('../configFiles/webpack.config');

    // search all entry points for the current run directory (they are spread over in webpack.json files)
    const entryPoints = webpackUtils.searchEntryPoints(process.cwd());

    // Build the webpack exports for the project at the current dir and node_modules
    const thisProjectWebpackExports = await webpackUtils.buildWebpackConfig(process.cwd(), onitConfigFile);

    // get the package json in the current directory
    let cwdPackageJson = path.join(process.cwd(), 'package.json');
    cwdPackageJson = JSON.parse(fs.readFileSync(cwdPackageJson).toString());

    // create a webpack config for the current path project
    let webpackConfig = webpackConfigFactory(logger, process.cwd(), {
        entryPoints: entryPoints
    }, cwdPackageJson);

    // merge the base webpack config with exports
    webpackConfig = _.mergeWith(webpackConfig, thisProjectWebpackExports, webpackUtils.webpackMergeFn);

    // generate a webpack watcher instance and run it
    return webpackWatcher(webpackConfig, logger);
};
