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

const path = require('path');
const loadIgnore = require('../../../../../lib/loadIgnore');
const copy = require('./lib/copy');
const webpack = require('./lib/webpack');
const clean = require('./lib/clean');

module.exports.build = async function (logger, buildTarget, targetDir, onitBuildFile) {
    const buildMode = buildTarget.mode || 'production';

    // prepare the ignore file processor. This will be used to match files to be copied into the build path
    const ig = loadIgnore([
        path.join(process.cwd(), './.onitbuildignore'),
        path.join(__dirname, '../configFiles/.defaultignore')
    ]);

    // create a copy of the project into the build path
    await copy(logger, targetDir, ig);

    // launch webpack build
    await webpack(logger, buildTarget.key || buildMode, onitBuildFile, buildMode);

    // clean the build directory
    await clean(logger, targetDir, buildMode);

    logger.info('Build completato.');
    logger.info('Directory di build: ' + targetDir);

    return {
        targetDir: targetDir
    };
};
