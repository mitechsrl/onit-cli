
const fse = require('fs-extra');
const path = require('path');
const ncp = require('ncp').ncp;

module.exports = (logger, ignoreFilter, targetDir) => {
    return new Promise((resolve, reject) => {

        logger.info("[COPY] Copio progetto nella directory di build "+targetDir+" in corso...");
        
        // make sure the target dir is available and empty
        try {
            if (fse.pathExistsSync(targetDir)) {
                logger.log("[COPY] Path build "+targetDir+' già esistente. Rimuovo...');
                fse.removeSync(targetDir);
                logger.log('[COPY] Path rimosso');
            }
        } catch (e) {
            logger.error(e);
        }
        
        logger.log('[COPY] Creo path di build '+targetDir);
        fse.ensureDirSync(targetDir);

        const baseDir = process.cwd();
        
        //const copyLog = [];
        let copied = 0;
        let skipped = 0;

        const options = {
            filter: (filename) => {
                const _p = path.relative(baseDir, filename);
                if (_p === '') return true;

                const ret = ignoreFilter.ignores(_p);
                if (!ret) {
                    copied++;
                    //logger.log('Copia '+ filename);
                    //copyLog.push('COPY ' + filename);
                } else {
                    skipped++;
                    logger.warn('[COPY] Skip ' + filename);
                    //copyLog.push('SKIP ' + filename);
                }
                return !ret;
            }
        };

        logger.log('[COPY] Copia files da ' + baseDir + ' a ' + targetDir);
        ncp('.', targetDir, options, function (err) {
            if (err) {
                return reject(err);
            }

            logger.info('[COPY] Copiati: '+ copied);
            logger.warn('[COPY] Saltati: '+ skipped);
            //console.log('Scrivo log copia...');

            //const filename = path.join('build\\copy-prod-' + (new Date().toISOString().replace(/:/g, '-')) + '.log';
            //console.log('log file: ' + filename);
            //fs.writeFileSync(filename, copyLog.join('\n'));
            logger.info('[COPY] Copia completata');

            resolve(0);
        });
    })
}