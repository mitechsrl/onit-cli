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
    const cwdPackageJson = JSON.parse(fs.readFileSync(path.join(context, 'package.json')).toString());

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
