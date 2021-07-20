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
const onitFileLoader = require('../../../../../lib/onitFileLoader');
const webpackUtils = require('../../../../../lib/webpack/utils');
const fs = require('fs');
const webpackWatcherPromiseGenerator = require('./webpackWatcherPromiseGenerator');

module.exports.start = async (logger, onitConfigFile) => {
    // load the default config
    const webpackConfigFactory = require('../configFiles/webpack.config');

    // create a webpack config for the current directory and
    // add dynamic entry points to the webpack config for the current directory
    const entryPoints = webpackUtils.searchEntryPoints(process.cwd());

    // read the web exports from
    const thisProjectWebpackExports = await webpackUtils.buildWebpackConfig(process.cwd(), onitConfigFile);

    // console.log(thisProjectWebpackExports);
    // check if we have a component at the current path. If true, auto add it as loadable module.
    let cwdPackageJson = path.join(process.cwd(), 'package.json');

    // get the package json in the current directory
    cwdPackageJson = JSON.parse(fs.readFileSync(cwdPackageJson).toString());
    // create a webpack config for the current path project
    let webpackConfig = webpackConfigFactory(logger, process.cwd(), {
        entryPoints: entryPoints
    }, cwdPackageJson);

    // merge the webpack exports if any
    webpackConfig = _.mergeWith(webpackConfig, thisProjectWebpackExports, webpackUtils.webpackMergeFn);

    // generate the array of webpack watcher instances and run'em all
    return webpackWatcherPromiseGenerator(webpackConfig, logger);
};
