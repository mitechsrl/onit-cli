const spawn = require('./spawn');
const logger = require('./logger');

// after some time (2 minutes), just check for newer versions and show a info in the console
// This is just for a reminder, doesn't do anything else.
module.exports = function () {
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
    }, 180000);
};
