#! /usr/bin/env node

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
const spawn = require('../lib/spawn');

// show CLI version
if (process.argv.length === 3 && process.argv[2] === '-v') {
    header();
    process.exit(0);
}

// after some time (2 minutes), just check for newer versions and show a info in the console
// This is just for a reminder, doesn't do anything else.
setTimeout(() => {
    spawn('npm', ['view', '@mitech/onit-cli', '--registry=https://registry.npmjs.org/', 'version'], false, { shell: true, cwd: __dirname })
        .then(status => {
            const semverGt = require('semver/functions/gt');
            const fs = require('fs');
            const path = require('path');
            const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
            status.data = status.data.trim();
            const newVersion = semverGt(status.data.trim(), packageJson.version);
            if (newVersion) {
                logger.warn('[ONIT-CLI UPDATE] A new version of onit-cli is available. Current: ' + packageJson.version + ', newer: ' + status.data + '. Install with <npm install -g ' + packageJson.name + '@' + status.data + '>');
            }
        });
}, 120000);

(async () => {
    try {
        await command.command(__dirname, process.argv.slice(2));
    } catch (e) {
        logger.error(e.message || e);
    }
    process.exit();
})();

