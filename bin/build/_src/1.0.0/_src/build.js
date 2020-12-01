const path = require('path');
const loadIgnore = require('../../../../../lib/loadIgnore');
const copy = require('./lib/copy');
const webpack = require('./lib/webpack');
const clean = require('./lib/clean');

module.exports.build = async function (logger, buildTarget, onitBuildFile) {
    const buildMode = buildTarget.mode || 'production';
    const targetDir = path.resolve(process.cwd(), './build/' + (buildTarget.key || buildMode));

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