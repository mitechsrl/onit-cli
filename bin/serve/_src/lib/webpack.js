const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const onitFileLoader = require('../../../../lib/onitFileLoader');
const webpackUtils = require('../../../../lib/webpack/utils');

module.exports.start = async (logger, cwdOnitRunFile, cwdOnitBuildFile) => {
    // load the default config
    const webpackConfigFactory = require('../../../../configFiles/serve/webpack.config');

    const webpackConfigs = [];

    // create a webpack config for the current directory and
    // add dynamic entry points to the webpack config for the current directory
    let cwdWebpackConfig = webpackConfigFactory(process.cwd());
    cwdWebpackConfig.entry = webpackUtils.searchEntryPoints(process.cwd());

    const buildWebpackData = (cwdOnitBuildFile.json.export || {}).webpack;
    if (buildWebpackData) {
        cwdWebpackConfig = _.mergeWith(cwdWebpackConfig, buildWebpackData, webpackUtils.webpackMergeFn);
    }
    webpackConfigs.push(cwdWebpackConfig);

    // get the list of components we want to load
    const components = (cwdOnitRunFile.json.loadComponents || [])
        .filter(c => c.enabled) // skip disabled ones
        .filter(c => c.path.indexOf('node_modules') < 0); // still never search stuff in ode_modules

    // create one webpack config for each one of the components loaded in dev environment
    for (const component of components) {
        const componentPath = path.resolve(process.cwd(), component.path);
        // create a webpack config for the current directory and
        // add dynamic entry points to the webpack config for the current directory
        let webpackConfig = webpackConfigFactory(componentPath);
        webpackConfig.entry = webpackUtils.searchEntryPoints(componentPath);

        // build the config for the dependencies
        const componentOnitBuildFile = await onitFileLoader.load('build', componentPath);
        const dependenciesData = await webpackUtils.getWebpackExportsFromDependencies(componentPath, componentOnitBuildFile);
        webpackConfig = _.mergeWith(webpackConfig, dependenciesData, webpackUtils.webpackMergeFn);

        // config completed.
        webpackConfigs.push(webpackConfig);
    }

    console.log(webpackConfigs);

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
