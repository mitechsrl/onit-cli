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
const webpackUtils = require('../../../../../lib/webpack/utils');
const { searchEntryPoints } = require('../../../../../shared/2.0.0/lib/searchEntryPoints');
const util = require('util');
const webpack = util.promisify(_webpack);
const path = require('path');
const fs = require('fs');
const logger = require('../../../../../lib/logger');

module.exports = async function (distFeTargetDir, onitConfigFile, buildMode, injectBuildOptions = null) {
    logger.info('[WEBPACK] Eseguo build webpack ' + (injectBuildOptions ? 'con configurazione extra ' + JSON.stringify(injectBuildOptions) : 'standard'));

    // load the default config
    const webpackConfigFactory = require('../configFiles/webpack.config');

    // const originalPath = process.cwd();
    const context = process.cwd();

    // create a webpack config for the current directory and
    // add dynamic entry points to the webpack config for the current directory
    const entryPoints = searchEntryPoints(context);

    // Build the webpack exports for the project at the current dir and node_modules
    const thisProjectWebpackExports = await webpackUtils.buildWebpackConfig(context, onitConfigFile);

    // get the package json in the current directory
    let cwdPackageJson = path.join(context, 'package.json');
    cwdPackageJson = JSON.parse(fs.readFileSync(cwdPackageJson).toString());

    // create a webpack config for the current path project
    let webpackConfig = webpackConfigFactory(context, {
        entryPoints: entryPoints,
        buildPath: distFeTargetDir
    }, cwdPackageJson);

    // webpack build is either development or production.
    // everything non-development is translated to roduction (even out 'test' mode)
    webpackConfig.mode = (buildMode !== 'development') ? 'production' : 'development';

    // merge the base webpack config with exports
    webpackConfig = _.mergeWith(webpackConfig, thisProjectWebpackExports, webpackUtils.webpackMergeFn);

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
    } catch (err) {
        // do we had internal errors?
        logger.error('[WEBPACK] Errore di compilazione');
        logger.error(err.stack || err);
        if (err.details) logger.error(err.details);
        throw new Error('Build aborted');
    }

    return 0;
};
