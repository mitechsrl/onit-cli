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
