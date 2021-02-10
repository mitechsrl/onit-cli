const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const onitFileLoader = require('../../../../../lib/onitFileLoader');
const webpackUtils = require('../../../../../lib/webpack/utils');
const fs = require('fs');

module.exports.start = async (logger, cwdOnitServeFile) => {
    // load the default config
    const webpackConfigFactory = require('../configFiles/webpack.config');

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

        cwdPackageJson = require(cwdPackageJson);
        if (cwdOnitBuildFile) {
            // create a webpack config for the current path project
            let cwdWebpackConfig = webpackConfigFactory(process.cwd(), {
                entryPoints: entryPoints
            }, cwdPackageJson);

            const buildWebpackData = (cwdOnitBuildFile.json.export || {}).webpack;
            if (buildWebpackData) {
                cwdWebpackConfig = _.mergeWith(cwdWebpackConfig, buildWebpackData, webpackUtils.webpackMergeFn);
            }

            // if the current project path is a module, we auto-inject required dependency: onit
            if (onitWebpackDependencies !== null) {
                cwdWebpackConfig = _.mergeWith(cwdWebpackConfig, onitWebpackDependencies, webpackUtils.webpackMergeFn);
            }

            webpackConfigs.push(cwdWebpackConfig);
        }
    }

    // start the load of other components (as defined them in the serve file)

    // get the list of components we want to load
    const components = (cwdOnitServeFile.json.loadComponents || [])
        .filter(c => c.enabled && c.enabledWebpack !== false) // skip disabled or non-webpack ones
        .filter(c => c.path.indexOf('node_modules') < 0); // still never search stuff in node_modules

    // create one webpack config for each one of the components loaded in dev environment
    for (const component of components) {
        const componentPath = path.resolve(process.cwd(), component.path);

        // search entry points for this component
        const componentEntryPoints = webpackUtils.searchEntryPoints(componentPath);

        // read the package json at the target component
        const componentPackageJson = require(path.join(componentPath, 'package.json'));

        // create a webpack config for the current directory and
        // add dynamic entry points to the webpack config for the current directory
        let webpackConfig = webpackConfigFactory(componentPath, {
            entryPoints: componentEntryPoints
        }, componentPackageJson);

        // build the config for the dependencies
        const componentOnitBuildFile = await onitFileLoader.load('build', componentPath);
        const dependenciesData = await webpackUtils.getWebpackExportsFromDependencies(componentPath, componentOnitBuildFile);
        webpackConfig = _.mergeWith(webpackConfig, dependenciesData, webpackUtils.webpackMergeFn);

        // if the current project path is a module, we auto-inject required dependency: onit
        if (onitWebpackDependencies !== null) {
            webpackConfig = _.mergeWith(webpackConfig, onitWebpackDependencies, webpackUtils.webpackMergeFn);
        }

        // config completed.
        webpackConfigs.push(webpackConfig);
    }

    // create a list of promises, each one will launch a webpack watcher managing one single config.
    const promises = webpackConfigs.map(webpackConfig => {
        return new Promise(resolve => {
            // watcher callback
            const componentName = path.basename(webpackConfig.context);

            // callback for build completed
            const watcherCallback = (err, stats) => {
                // do we had internal errors?
                if (err) {
                    logger.error('[WEBPACK] ' + componentName + ' - compile error');
                    logger.error(err.stack || err);
                    if (err.details) logger.error(err.details);
                    return;
                }

                // do we had compile errors?
                const info = stats.toJson();
                if (stats.hasErrors()) {
                    logger.error('[WEBPACK] ' + componentName + ' - compile error');
                    info.errors.forEach(e => logger.error(e));
                    return;
                }

                console.info('[WEBPACK] ' + componentName + ' - Compile finished');
            };
            // create a compiler based on the config
            const compiler = webpack(webpackConfig);

            // start the watcher!
            const watcher = compiler.watch({
                aggregateTimeout: 500,
                ignored: ['files/**/*.js', 'node_modules/**']
            }, watcherCallback);

            // catch the SIGINT and then stop the watcher
            process.on('SIGINT', () => {
                logger.warn('[WEBPACK] ' + componentName + ' - Stop webpack watcher...');
                watcher.close(() => {
                    logger.warn('[WEBPACK] ' + componentName + ' - Webpack watch stopped');
                    resolve(0);
                });
            });
        });
    });

    return Promise.all(promises);
};
