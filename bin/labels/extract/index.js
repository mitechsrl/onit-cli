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

//const extract = require('./_src/extract');

module.exports.info = 'Utility estrazione labels';
module.exports.help = [
    ['-f filename','File da processare']
];
module.exports.catchUnimplementedParams = true;
module.exports.cmd = async function (basepath, params, logger) {
    logger.info('Verifica directory corrente');

    
    // get the input file: the one marked from -f or the first param
    let inputFile = params.get('-f');
    if (!inputFile.found || !inputFile.value){
        inputFile = params[0];
    }else{
        inputFile = inputFile.value;
    }

    console.log(inputFile)

    // extract.checkDirectory(process.cwd(), logger);
};
