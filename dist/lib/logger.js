"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const colors_1 = require("colors");
const node_emoji_1 = require("node-emoji");
const verbose = process.argv.find(c => c === '--verbose');
// list of emojis: https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
const logger = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawLog: (message) => process.stdout.write(message),
    log: (message) => console.log((0, node_emoji_1.emojify)(message)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (message) => console.log((0, node_emoji_1.emojify)((0, colors_1.red)(message))),
    warn: (message) => console.log((0, node_emoji_1.emojify)((0, colors_1.yellow)(message))),
    info: (message) => console.log((0, node_emoji_1.emojify)((0, colors_1.green)(message))),
    success: (message) => console.log((0, node_emoji_1.emojify)((0, colors_1.green)(message))),
    verbose: (message) => {
        if (verbose) {
            console.log((0, colors_1.magenta)('VERBOSE: ' + message));
        }
    }
};
exports.logger = logger;
//# sourceMappingURL=logger.js.map