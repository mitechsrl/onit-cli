"use strict";
/*
Copyright (c) 2021 Mitech S.R.L.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
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
    },
    debug: (message) => {
        if (verbose) {
            console.log((0, colors_1.magenta)('DEBUG: ' + message));
        }
    }
};
exports.logger = logger;
//# sourceMappingURL=logger.js.map