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
const fs = require('fs');
const fse = require('fs-extra');
const find = require('find');
const loadIgnore = require('../../../../../../lib/loadIgnore');
/**
 *
 * @param {*} logger
 * @param {*} localPath
 */
const removePath = (logger, localPath) => {
    if (fse.pathExistsSync(localPath)) {
        logger.log('Rimuovo ' + localPath);
        fse.removeSync(localPath);
    }
};

/**
 *
 * @param {*} logger
 * @param {*} buildMode
 */
const cleanPackageJson = (logger, buildMode) => {
    logger.log('Rimuovo valori non voluti da package.json');
    const json = JSON.parse(fs.readFileSync('package.json'));
    const start = json.scripts.start;

    json.scripts = { start: start };
    delete json.husky;
    delete json.devDependencies;
    json._productionBuild = buildMode === 'production';

    fs.writeFileSync('package.json', JSON.stringify(json, null, 2));
};

/**
 *
 */
const removeFiles = (logger, files) => {
    files.forEach(f => {
        if (fs.existsSync(f)) {
            logger.log('Rimuovo ' + f);
            fs.unlinkSync(f);
        }
    });
};
module.exports = async (logger, targetDir, onitBuildFile, buildMode) => {
    logger.info('[CLEAN] Eseguo clean finale...');

    const originalPath = process.cwd();

    // change the working directory in the build path
    process.chdir(targetDir);

    // clean stages
    removePath(logger, 'node_modules');
    removePath(logger, 'dev-utils');

    cleanPackageJson(logger, buildMode);

    // on development we must propagate the exports to be able later to use it for build other components
    if (buildMode !== 'development') {
        removeFiles(logger, [
            'onitbuild.config.js',
            'onitbuild.config.json'
        ]);
    }

    // TODO: usare ig in qualche modo
    const ig = loadIgnore([
        path.join(__dirname, '../../../../configFiles/build/.clean')
    ]);

    logger.info('[CLEAN] completato');
    process.chdir(originalPath);

    return 0;
};
