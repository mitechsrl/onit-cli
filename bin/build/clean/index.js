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

module.exports.info = 'Build clean utility. Pulisce la directory di build';
module.exports.help = [];

module.exports.cmd = async function (basepath, params, logger) {
    const _p = path.join(process.cwd(), './build');
    fse.removeSync(_p);
    fse.ensureDirSync(_p);
};
