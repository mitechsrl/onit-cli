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
    },
    debug: (message: string) => {
        if (verbose){
            console.log(magenta('DEBUG: '+message));
        }
    }
};

export { logger };