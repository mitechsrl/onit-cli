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
const path = require('path');
const fs = require('fs');
const semverMaxSatisfying = require('semver/ranges/max-satisfying');

module.exports.info = 'Build utility. Compila il progetto in un pacchetto pronto per il deploy';
module.exports.help = [];

module.exports.cmd = async function (basepath, params, logger) {
    try {
        // load the buildFile
        const onitBuildFile = await onitFileLoader.load('build');
        logger.warn('Uso file build ' + onitBuildFile.filename);

        // lock to the required builder version or get the most recent one
        const requiredVersion = onitBuildFile.json.builderVersion || '*';

        // load the available build versions
        const availableVersions = fs.readdirSync(path.join(__dirname, './_src'));

        // use npm semver to select the most recent usable version
        const version = semverMaxSatisfying(availableVersions, requiredVersion);

        if (!version) throw new Error('Nessuna versione builder compatibile con ' + requiredVersion + ' trovata. Verifica il valore buildVersion del tuo file onitBuild oppure aggiorna onit-cli');

        // version found: Load that builder and use it.
        logger.info('Uso builder V' + version);
        const builder = require(path.join(__dirname, './_src/' + version + '/index.js'));

        await builder.start(onitBuildFile, version, basepath, params, logger);
    } catch (e) {
        logger.error(e.message);
        logger.error('Build interrotto');
        process.exit(-1);
    }
};
