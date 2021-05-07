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
const { loadWebpackComponent } = require('./loadWebpackComponent');
const webpackWatcherPromiseGenerator = require('./webpackWatcherPromiseGenerator');

module.exports.start = async (logger, cwdOnitServeFile) => {
    // load the default config
    const webpackConfigFactory = require('../configFiles/webpack.config');

    // cache for the webpack configurations to be run
    const webpackConfigs = [];

    // create a webpack config for the current directory and
    // add dynamic entry points to the webpack config for the current directory
    const entryPoints = webpackUtils.searchEntryPoints(process.cwd());

    // if the current project path is a module, prepare the required dependency: onit
    let onitWebpackDependencies = null;
    if (cwdOnitServeFile.json.component) {
        // FIXME: questo diventerà @mitech/onit
        const onitPathAsDep = path.join(process.cwd(), './node_modules/@mitech/mitown');
        const onitBuildFile = await onitFileLoader.load('build', onitPathAsDep);
        onitWebpackDependencies = await webpackUtils.getWebpackExportsFromDependencies(onitPathAsDep, onitBuildFile);
    }

    // check if we have a component at the current path. If true, auto add it as loadable module.
    let cwdPackageJson = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(cwdPackageJson)) {
        // check if the current path is a onit-valid directory
        let cwdOnitBuildFile = null;
        try {
            cwdOnitBuildFile = await onitFileLoader.load('build');
        } catch (error) {
            if (error.notFound === true) {
                // this is not a onit-valid direcotry. Just skip this load
                logger.log('Skip webpack setup for the current directory');
            } else if (error) {
                // the file was found but the load failed. This is a serious error, rethrow it.
                throw error;
            }
        }

        // continue if we have a valid onitRun file
        if (cwdOnitBuildFile) {
            // get the package json in the current directory
            cwdPackageJson = JSON.parse(fs.readFileSync(cwdPackageJson).toString());
            // create a webpack config for the current path project
            let cwdWebpackConfig = webpackConfigFactory(logger, process.cwd(), {
                entryPoints: entryPoints
            }, cwdPackageJson);

            // merge the webpack exports if any
            const buildWebpackData = (cwdOnitBuildFile.json.export || {}).webpack;
            if (buildWebpackData) { cwdWebpackConfig = _.mergeWith(cwdWebpackConfig, buildWebpackData, webpackUtils.webpackMergeFn); }

            // if the current project path is a module, we auto-inject required dependency: onit
            if (onitWebpackDependencies !== null) { cwdWebpackConfig = _.mergeWith(cwdWebpackConfig, onitWebpackDependencies, webpackUtils.webpackMergeFn); }

            // try to resolve dependencies of this module.
            // FIXME: load automatically the ones from node_modules
            // Attualmente la lsta delle dependencies è quella del onitbuildfile.dependencies. Dovrebbe per lo meno caricare in auto quelle che ci sono in node_modules
            // poichè essendo installate come dipendenze del progetto, è ovvio che siano dipendenze e quindi non andrebbero rispecificate
            const thisModuleDependencies = await webpackUtils.getWebpackExportsFromDependencies(path.dirname(cwdOnitBuildFile.filename), cwdOnitBuildFile);
            if (thisModuleDependencies !== null) {
                cwdWebpackConfig = _.mergeWith(cwdWebpackConfig, thisModuleDependencies, webpackUtils.webpackMergeFn);
            }

            webpackConfigs.push(cwdWebpackConfig);
        }
    }

    // start the load of other components (as defined them in the serve file)

    // get the list of components we want to load
    const components = (cwdOnitServeFile.json.loadComponents || [])
        .filter(c => c.enabled && c.enabledWebpack !== false) // skip disabled or non-webpack ones
        .filter(c => c.path.indexOf('node_modules') < 0); // do not add a webpack config (and watcher) for stuff in node_modules

    // create one webpack config for each one of the components loaded in dev environment
    for (const component of components) {
        let webpackConfig = await loadWebpackComponent(component, logger, webpackConfigFactory);

        // if the current project path is a module, we auto-inject required dependency: onit
        if (onitWebpackDependencies !== null) {
            webpackConfig = _.mergeWith(webpackConfig, onitWebpackDependencies, webpackUtils.webpackMergeFn);
        }

        // config completed.
        webpackConfigs.push(webpackConfig);
    }

    // generate the array of webpack watcher instances and run'em all
    const webpackWatchersPromises = webpackWatcherPromiseGenerator(webpackConfigs, logger);
    return Promise.all(webpackWatchersPromises);
};
