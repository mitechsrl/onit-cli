const _ = require('lodash');
const _webpack = require('webpack');
const webpackUtils = require('../../../../lib/webpack/utils');
const util = require('util');
const webpack = util.promisify(_webpack);

module.exports = async function (logger, targetDir, onitBuildFile, buildMode, injectBuildOptions = null) {
    logger.info('[WEBPACK] Eseguo build webpack ' + (injectBuildOptions ? 'con configurazione extra ' + JSON.stringify(injectBuildOptions) : 'standard'));

    const originalPath = process.cwd();

    // change the working directory in the build path
    process.chdir(targetDir);

    // load the default config
    let webpackConfig = require('../../../../configFiles/build/webpack.config');

    // webpackConfig build mode (defaults to production)
    if (buildMode !== 'production') {
        webpackConfig.mode = buildMode;
    }

    // add dynamic entry points to the webpack config
    webpackConfig.entry = webpackUtils.searchEntryPoints(process.cwd());

    // get a combined weback config from this package and dependencies
    const webpackExported = await webpackUtils.getWebpackExportsFromDependencies(process.cwd(), onitBuildFile);
    webpackConfig = _.mergeWith(webpackConfig, webpackExported, webpackUtils.webpackMergeFn);

    // add externally-provided options if any
    if (injectBuildOptions) {
        webpackConfig = _.mergeWith(webpackConfig, injectBuildOptions, webpackUtils.webpackMergeFn);
    }

    // TODO: aggiungere flag verbose per vedere piu info come questa?
    try {
        const stats = await webpack(webpackConfig);

        // do we had compile errors?
        if (stats) {
            const info = stats.toJson();
            if (stats.hasErrors()) {
                logger.error('[WEBPACK] Errore di compilazione');
                info.errors.forEach(e => logger.error(e));
                throw new Error('Build aborted');
            }
        }

        console.info('[WEBPACK] Compile completato');

        // change back to the original directory
        process.chdir(originalPath);
    } catch (err) {
    // do we had internal errors?

        logger.error('[WEBPACK] Errore di compilazione');
        logger.error(err.stack || err);
        if (err.details) logger.error(err.details);
        throw new Error('Build aborted');
    }

    return 0;
};
