const _ = require('lodash');
const _webpack = require('webpack');
const webpackUtils = require('../../../../../../lib/webpack/utils');
const util = require('util');
const webpack = util.promisify(_webpack);
const path = require('path');

module.exports = async function (logger, distTargetDir, onitBuildFile, buildMode, injectBuildOptions = null) {
    logger.info('[WEBPACK] Eseguo build webpack ' + (injectBuildOptions ? 'con configurazione extra ' + JSON.stringify(injectBuildOptions) : 'standard'));

    // load the default config
    const webpackConfigFactory = require('../../configFiles/webpack.config');

    // const originalPath = process.cwd();
    const context = process.cwd();

    // change the working directory in the build path

    // create a webpack config for the current directory and
    // add dynamic entry points to the webpack config for the current directory
    const entryPoints = webpackUtils.searchEntryPoints(context);

    // geth the package component at the current path
    const cwdPackageJson = require(path.join(context, 'package.json'));

    // create a webpack config for the current path project
    let cwdWebpackConfig = webpackConfigFactory(context, {
        entryPoints: entryPoints,
        buildPath: 'build/' + distTargetDir
    }, cwdPackageJson);

    // webpackConfig build mode (defaults to production)
    if (buildMode !== 'production') {
        cwdWebpackConfig.mode = buildMode;
    }

    // get a combined weback config from this package and dependencies
    const webpackExported = await webpackUtils.getWebpackExportsFromDependencies(context, onitBuildFile);
    cwdWebpackConfig = _.mergeWith(cwdWebpackConfig, webpackExported, webpackUtils.webpackMergeFn);

    // add externally-provided options if any
    if (injectBuildOptions) {
        cwdWebpackConfig = _.mergeWith(cwdWebpackConfig, injectBuildOptions, webpackUtils.webpackMergeFn);
    }

    // TODO: aggiungere flag verbose per vedere piu info come questa?
    try {
        const stats = await webpack(cwdWebpackConfig);

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
        // process.chdir(originalPath);
    } catch (err) {
        // do we had internal errors?
        logger.error('[WEBPACK] Errore di compilazione');
        logger.error(err.stack || err);
        if (err.details) logger.error(err.details);
        throw new Error('Build aborted');
    }

    return 0;
};