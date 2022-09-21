#!/usr/bin/env node

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

const logger = require('../lib/logger');
const command = require('../lib/command');
const header = require('../lib/header');
const npmVersionCheck = require('../lib/npmVersionCheck');
const { printError } = require('../lib/printError');
const { setupOutputRedirecion, closeOutputRedirction } = require('../lib/outputRedirection');

// show CLI version
if (process.argv.length === 3 && process.argv[2] === '-v') {
    header();

    // eslint-disable-next-line no-process-exit
    process.exit(0);
}

// launch the npm version check. This will trigger after 3 minutes on uptime
npmVersionCheck();

// handler for any other command
(async () => {
    const redirectOutput = process.argv.find(p => p === '--log-to-file');
    if (redirectOutput) {
        await setupOutputRedirecion();
    }
    try {
        await command.command(__dirname, process.argv.slice(2));
    } catch (e) {
        printError(e);
    }

    if (redirectOutput) {
        closeOutputRedirction();
    }
    // eslint-disable-next-line no-process-exit
    process.exit();
})();

