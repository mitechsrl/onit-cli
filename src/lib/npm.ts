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

import os from 'os';
import { spawn } from './spawn';
import { getPersistent, setPersistent } from './persistent';
import { logger } from './logger';
import { packageJson } from './packageJson';
import gt from 'semver/functions/gt';
// windows being windows... it wants the .cmd extension!
export const npmExecutable = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
export const npxExecutable = os.platform() === 'win32' ? 'npx.cmd' : 'npx';

type PersistentUpdate = {
    newversion: string,
    update: boolean,
    lastCheck: string
};
// after some time (3 minutes), just check for newer versions and show a info in the console
// This is just for a reminder, doesn't do anything else.
export function npmVersionCheck() {

    const updateStatus = getPersistent('update') as PersistentUpdate;
    if (updateStatus?.update) {
        logger.warn('[ONIT-CLI UPDATE] A new version of onit-cli is available. Current: ' + packageJson.version + ', newer: ' + updateStatus.newversion + '. Install with <npm install -g ' + packageJson.name + '>');
    }

    // check for npm registry updates. Do it once each hour to prevent too many calls
    if ((!updateStatus?.lastCheck) || (((new Date().getTime() - new Date(updateStatus.lastCheck).getTime()) / 1000) > 3600)) {
        const t = setTimeout(() => {
            const npmParams = ['view', packageJson.name, '--registry=https://registry.npmjs.org/', 'version'];
            spawn(npmExecutable, npmParams, false, { shell: true, cwd: __dirname })
                .then(status => {
                    status.output = status.output.trim();
                    updateStatus.update = gt(status.output, packageJson.version);
                    if (updateStatus.update) {
                        updateStatus.newversion = status.output;
                    } else {
                        updateStatus.newversion = packageJson.version;
                    }

                    updateStatus.lastCheck = new Date().toISOString();
                    setPersistent('update', updateStatus);
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .catch(e => { /** ignore any error */});
        }, 60*1000);

        t.unref();
    }
}