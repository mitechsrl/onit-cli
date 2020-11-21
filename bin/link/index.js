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

const persistent = require('../../lib/persistent');

module.exports.info = 'Dev dependency link utility';
module.exports.help = [
    ['-t', 'tag']
];

module.exports.cmd = async function (basepath, params, logger) {
    
    let tag = params.get('-t');
    if (!tag.found || !tag.value){
        logger.error("Nessun tag specificato. Usa -t TAG per specificaren uno");
        return;
    }else{
        tag = tag.value;
    }

    let force = params.get('-f').found;


    const config = persistent.get("dependency-link");
    if (!force && config[tag]) {
        logger.error("Tag già in uso. Specificane uno diverso oppure usa -f per forzare la sovrascrittura");
    }

    config[tag] = process.cwd();

    persistent.set("dependency-link", config);
    
    logger.info("Tag "+tag+" creato. Punta a "+process.cwd())
};
