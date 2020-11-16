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

var colors = require('colors');

module.exports = {
    rawLog: message => process.stdout.write(message),
    log: message => console.log(message),
    error: message => console.log(colors.red(message)),
    warn: message => console.log(colors.yellow(message)),
    info: message => console.log(colors.green(message)),
    debug: message => console.log(colors.blue(message))
};
