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

/**
 * Create a webpack config for a loaded component
 * @param {*} component
 * @param {*} logger
 * @param {*} webpackConfigFactory
 * @returns
 */
async function loadWebpackComponent (component, logger, webpackConfigFactory) {
    const componentPath = path.resolve(process.cwd(), component.path);

    // search entry points for this component
    const componentEntryPoints = webpackUtils.searchEntryPoints(componentPath);

    // read the package json at the target component
    const componentPackageJson = JSON.parse(fs.readFileSync(path.join(componentPath, 'package.json')).toString());

    // create a webpack config for the current directory and
    // add dynamic entry points to the webpack config for the current directory
    let webpackConfig = webpackConfigFactory(logger, componentPath, {
        entryPoints: componentEntryPoints
    }, componentPackageJson);

    // build the config for the dependencies
    const componentOnitBuildFile = await onitFileLoader.load('build', componentPath);
    const dependenciesData = await webpackUtils.getWebpackExportsFromDependencies(componentPath, componentOnitBuildFile);
    webpackConfig = _.mergeWith(webpackConfig, dependenciesData, webpackUtils.webpackMergeFn);
    return webpackConfig;
}
exports.loadWebpackComponent = loadWebpackComponent;
