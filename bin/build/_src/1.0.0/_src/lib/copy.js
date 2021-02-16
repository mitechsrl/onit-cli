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

const fse = require('fs-extra');
const path = require('path');
const ncp = require('ncp').ncp;
const fs = require('fs');

module.exports = (logger, targetDir, ignoreFilter) => {
    return new Promise((resolve, reject) => {
        logger.info('[COPY] Copio progetto nella directory di build ' + targetDir + ' in corso...');

        // make sure the target dir is available and empty
        try {
            if (fse.pathExistsSync(targetDir)) {
                logger.log('[COPY] Path build ' + targetDir + ' già esistente. Rimuovo...');
                fse.removeSync(targetDir);
                logger.log('[COPY] Path rimosso');
            }
        } catch (e) {
            logger.error(e);
        }

        logger.log('[COPY] Creo path di build ' + targetDir);
        fse.ensureDirSync(targetDir);

        const baseDir = process.cwd();

        const copyLog = [];
        let copied = 0;
        let skipped = 0;

        const options = {
            filter: (filename) => {
                const _p = path.relative(baseDir, filename);
                if (_p === '') return true;

                const ret = ignoreFilter.ignores(_p);
                if (!ret) {
                    copied++;
                    // logger.log('Copia '+ filename);
                    copyLog.push('COPY ' + filename);
                } else {
                    skipped++;
                    logger.warn('[COPY] Skip ' + filename);
                    copyLog.push('SKIP ' + filename);
                }
                return !ret;
            }
        };

        logger.log('[COPY] Copia files da ' + baseDir + ' a ' + targetDir);
        ncp('.', targetDir, options, function (err) {
            if (err) {
                return reject(err);
            }

            logger.info('[COPY] Copiati: ' + copied);
            logger.warn('[COPY] Saltati: ' + skipped);
            console.log('Scrivo log copia...');

            const filename = path.join(targetDir, '../copy-prod-' + (new Date().toISOString().replace(/:/g, '-')) + '.log');
            console.log('log file: ' + filename);
            fs.writeFileSync(filename, copyLog.join('\n'));
            logger.info('[COPY] Copia completata');

            resolve(0);
        });
    });
};
