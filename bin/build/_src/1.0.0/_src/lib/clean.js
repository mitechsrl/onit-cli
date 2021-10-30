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

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const loadIgnore = require('../../../../../../lib/loadIgnore');
const logger = require('../../../../../../lib/logger');
/**
 *
 * @param {*} localPath
 */
const removePath = (localPath) => {
    if (fse.pathExistsSync(localPath)) {
        logger.log('Rimuovo ' + localPath);
        fse.removeSync(localPath);
    }
};

/**
 *
 * @param {*} buildMode
 */
const cleanPackageJson = (buildMode) => {
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
const removeFiles = (files) => {
    files.forEach(f => {
        if (fs.existsSync(f)) {
            logger.log('Rimuovo ' + f);
            fs.unlinkSync(f);
        }
    });
};
module.exports = async (targetDir, onitConfigFile, buildMode) => {
    logger.info('[CLEAN] Eseguo clean finale...');

    const originalPath = process.cwd();

    // change the working directory in the build path
    process.chdir(targetDir);

    // clean stages
    removePath('node_modules');
    removePath('dev-utils');

    cleanPackageJson(buildMode);

    // on development we must propagate the exports to be able later to use it for build other components
    if (buildMode !== 'development') {
        removeFiles([
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
