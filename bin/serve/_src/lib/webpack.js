const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const find = require('find');
const onitFileLoader = require('../../../../lib/onitFileLoader');
const webpackUtils = require('../../../../lib/webpack/utils');


module.exports.start = async (logger, onitRunFile, mainOnitBuildFile) => {

    // load the default config
    let  webpackConfig = require('../../../../configFiles/serve/webpack.config');

    // add dynamic entry points to the webpack config
    webpackConfig.entry = webpackUtils.searchEntryPoints(onitRunFile);

    const onitBuildWebpackData = await webpackUtils.getOnitBuildFilesData(onitRunFile, mainOnitBuildFile);

    webpackConfig = _.mergeWith(webpackConfig, onitBuildWebpackData, webpackUtils.webpackMergeFn);

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
        const compiler = webpack(webpackConfig);

        // start the watcher!
        const watcher = compiler.watch({
            aggregateTimeout: 500,
            ignored: ['files/**/*.js', 'node_modules/**']
        }, watcherCallback);


        process.on('SIGINT',() =>{
            logger.warn("Stop webpack watcher...");
            watcher.close(() => {
                logger.warn("Webpack watch stopped");
                resolve(0);
            });
        })
    })
}