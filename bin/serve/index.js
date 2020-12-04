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

const onitFileLoader = require('../../lib/onitFileLoader');
const fs = require('fs');
const path = require('path');
const semverMaxSatisfying = require('semver/ranges/max-satisfying');

module.exports.info = 'Dev Run/serve utility. Lancia il progetto in ambiente di sviluppo';
module.exports.help = [
    ['-w', 'Esegui solo webpack, skip nodemon'],
    ['-n', 'Esegui solo nodemon, skip webpack']
];

module.exports.cmd = async function (basepath, params, logger) {
    try {
        // load the buildFile
        const onitServeFile = await onitFileLoader.load('serve');
        logger.warn('Uso file build ' + onitServeFile.filename);

        // lock to the required builder version or get the most recent one
        const requiredVersion = onitServeFile.json.serveVersion || '*';

        // get a list of the available versions (each dir describe one version)
        const availableVersions = fs.readdirSync(path.join(__dirname, './_src'));

        // use npm semver to select the most recent usable version
        const version = semverMaxSatisfying(availableVersions, requiredVersion);

        if (!version) throw new Error('Nessuna versione di serve compatibile con ' + requiredVersion + ' trovata. Verifica il valore serveVersion del tuo file onitserve oppure aggiorna onit-cli');

        // version found: Load that builder and use it.
        logger.info('Uso serve V' + version);
        const serve = require(path.join(__dirname, './_src/' + version + '/index.js'));

        await serve.start(onitServeFile, version, basepath, params, logger);
    } catch (e) {
        logger.error(e.message);
        logger.error('Build interrotto');
        process.exit(-1);
    }
};
