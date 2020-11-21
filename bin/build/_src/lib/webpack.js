const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const webpackUtils = require('../../../../lib/webpack/utils');

module.exports = (logger, targetDir, onitBuildFile, buildMode, injectBuildOptions = null) => {

    return new Promise(async (resolve, reject) => {

        logger.info("[WEBPACK] Eseguo build webpack "+(injectBuildOptions ? "con configurazione extra "+JSON.stringify(injectBuildOptions): "standard"));

        const originalPath = process.cwd();

        // change the working directory in the build path
        process.chdir(targetDir);

        // load the default config
        let  webpackConfig = require('../../../../configFiles/build/webpack.config');

        // webpackConfig build mode (defaults to production)
        if( buildMode !== 'production'){
            webpackConfig.mode = buildMode;
        }

        // add dynamic entry points to the webpack config
        webpackConfig.entry = webpackUtils.searchEntryPoints();

        // get a combined weback config from this package and dependencies
        const onitBuildWebpackData = await webpackUtils.getOnitBuildFilesData(null, onitBuildFile);

        webpackConfig = _.mergeWith(webpackConfig, onitBuildWebpackData, webpackUtils.webpackMergeFn);

        if (injectBuildOptions){
            webpackConfig = _.mergeWith(webpackConfig, injectBuildOptions, webpackUtils.webpackMergeFn);
        }

        // TODO: aggiungere flag verbose per vedere piu info come questa?
        // console.log(webpackConfig);
        webpack(webpackConfig, (err, stats) => {
            // do we had internal errors?
            if (err) {
                logger.error('[WEBPACK] Errore di compilazione');
                logger.error(err.stack || err);
                if (err.details) logger.error(err.details);
                return reject(new Error("Build aborted"));
            }

            // do we had compile errors?
            const info = stats.toJson();
            if (stats.hasErrors()) {
                logger.error('[WEBPACK] Errore di compilazione');
                info.errors.forEach(e => logger.error(e));
                return reject(new Error("Build aborted"));
            }


            console.info('[WEBPACK] Compile completato');
        
            // change back to the original directory
            process.chdir(originalPath);
            resolve(0);
        });
    })
}