/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

const _ = require('lodash');
const _webpack = require('webpack');
const webpackUtils = require('../../../../../../lib/webpack/utils');
const util = require('util');
const webpack = util.promisify(_webpack);
const path = require('path');
const onitFileLoader = require('../../../../../../lib/onitFileLoader');
const fs = require('fs');

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

    // webpack build is either development or production.
    // everything non-development is translated to roduction (even out 'test' mode)
    cwdWebpackConfig.mode = (buildMode !== 'development') ? 'production' : 'development';

    // if the current project path is a module, we auto-inject required dependency: mitown
    if (onitBuildFile.json.component) {
        // on build-as component, mit-own is inherently a dependency. Removing from the manual added list
        // to avoid later parses since one is done here manually.
        onitBuildFile.json.dependencies = (onitBuildFile.json.dependencies || []).filter(d => d !== 'mit-own');

        // load here mit-own data
        const mitownPathAsDep = path.join(process.cwd(), './node_modules/@mitech/mitown');
        const mitownBuildFile = await onitFileLoader.load('build', mitownPathAsDep);
        const dependenciesData = await webpackUtils.getWebpackExportsFromDependencies(mitownPathAsDep, mitownBuildFile);
        cwdWebpackConfig = _.mergeWith(cwdWebpackConfig, dependenciesData, webpackUtils.webpackMergeFn);
    }

    // load dependencies webpack exports
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
