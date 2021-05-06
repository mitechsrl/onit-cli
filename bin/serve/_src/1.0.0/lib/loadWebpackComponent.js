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
