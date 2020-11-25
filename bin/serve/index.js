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

const serve = require('./_src/serve');

module.exports.info = 'Dev Run/serve utility. Lancia il progetto in ambiente di sviluppo';
module.exports.help = [
    ['-w', 'Esegui solo webpack, skip nodemon'],
    ['-n', 'Esegui solo nodemon, skip webpack']
];

module.exports.cmd = async function (basepath, params, logger) {
    await serve.serve(logger, params);
};
