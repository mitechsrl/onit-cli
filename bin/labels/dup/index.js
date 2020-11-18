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

const checker = require('./_src/duplicate');

module.exports.info = 'Utility verifica duplicazione e correzione labels.';
module.exports.help = [
    'Questa utility verifica i files json delle labels alla ricerca di duplicati.',
    'Esegue rimozione in-place verificando che non esistano duplicati sia intra-json, che cross-json'
];

module.exports.cmd = async function (basepath, params, logger) {
    logger.info('Verifica directory corrente');

    checker.checkDirectory(process.cwd(), logger);
};
