const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const find = require('find');
const loadIgnore = require('./loadIgnore');
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
module.exports = async (logger, targetDir, buildMode) => {
    logger.info('[CLEAN] Eseguo clean finale...');

    const originalPath = process.cwd();

    // change the working directory in the build path
    process.chdir(targetDir);

    // clean stages
    removePath(logger, 'node_modules');
    removePath(logger, 'dev-utils');
    removeFiles(logger, [
        'onitbuild.config.js',
        'onitbuild.config.json'
    ]);

    cleanPackageJson(logger, buildMode);

    // TODO: usare ig in qualche modo
    const ig = loadIgnore([
        path.join(__dirname, '../../../../configFiles/build/.clean')
    ]);

    logger.info('[CLEAN] completato');
    process.chdir(originalPath);

    return 0;
};
