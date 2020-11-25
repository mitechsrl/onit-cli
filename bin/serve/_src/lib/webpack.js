const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const find = require('find');
const onitFileLoader = require('../../../../lib/onitFileLoader');
const webpackUtils = require('../../../../lib/webpack/utils');

const wepbackParallel = require('parallel-webpack').run

module.exports.start = async (logger, cwdOnitRunFile, cwdOnitBuildFile) => {

    // load the default config
    let  webpackConfigFactory = require('../../../../configFiles/serve/webpack.config');

    let webpackConfigs = [];

    // create a webpack config for the current directory and
    // add dynamic entry points to the webpack config for the current directory
    const cwdWebpackConfig = webpackConfigFactory(process.cwd());    
    cwdWebpackConfig.entry = webpackUtils.searchEntryPoints(process.cwd());
    webpackConfigs.push(cwdWebpackConfig);

    // create one webpack config for each one of the components loaded in dev environment
    (cwdOnitRunFile.json.loadComponents || [])
        .filter(c => c.enabled) // skip disabled ones
        .filter(c => c.path.indexOf('node_modules')<0) // still never search stuff in ode_modules
        .forEach(component => {
            const componentPath = path.resolve(process.cwd(), component.path);
            // create a webpack config for the current directory and
            // add dynamic entry points to the webpack config for the current directory
            const webpackConfig = webpackConfigFactory(componentPath);    
            webpackConfig.entry = webpackUtils.searchEntryPoints(componentPath);
            webpackConfigs.push(webpackConfig);
        })
    console.log(webpackConfigs);


    
    /*const onitBuildWebpackData = await webpackUtils.getOnitBuildFilesData(onitRunFile, mainOnitBuildFile);

    webpackConfig = _.mergeWith(webpackConfig, onitBuildWebpackData, webpackUtils.webpackMergeFn);
    
    */

    // watcher callback
    const watcherCallback = (err, stats) => {
        // do we had internal errors?
        if (err) {
            logger.error('[WEBPACK] compile error');
            logger.error(err.stack || err);
            if (err.details) logger.error(err.details);
            return;
        }

        // do we had compile errors?
        const info = stats.toJson();
        if (stats.hasErrors()) {
            logger.error('[WEBPACK] compile error');
            info.errors.forEach(e => logger.error(e));
            return;
        }

        console.info('[WEBPACK] Compile finished');
    }


    return new Promise(resolve =>{

        // create a compiler based on the config
        const compiler = wepbackParallel(webpackConfigs,
            {
                maxRetries: 1,
                stats: true, // defaults to false
                maxConcurrentWorkers: 2 // use 2 workers
            }, watcherCallback);

        console.log(compiler);
        process.on('SIGINT',() =>{
            logger.warn("Stop webpack watcher...");
            watcher.close(() => {
                logger.warn("Webpack watch stopped");
                resolve(0);
            });
        })
    })
}