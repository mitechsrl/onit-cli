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

import { red, yellow, green, gray, magenta } from 'colors';
import { emojify } from 'node-emoji';
const verbose = process.argv.find(c => c ==='--verbose');
// list of emojis: https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
const logger = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawLog: (message: any) => process.stdout.write(message),
    log: (message: string) => console.log(emojify(message)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (message: any) => console.log(emojify(red(message))),
    warn: (message: string) => console.log(emojify(yellow(message))),
    info: (message: string) => console.log(emojify(green(message))),
    success: (message: string) => console.log(emojify(green(message))),

    verbose: (message: string) => {
        if (verbose){
            console.log(magenta('VERBOSE: '+message));
        }
    }
};

export { logger };