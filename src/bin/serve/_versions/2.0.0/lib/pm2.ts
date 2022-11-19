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

import fs from 'fs';
import _ from 'lodash';
import { spawn } from '../../../../../lib/spawn';
import { GenericObject, OnitConfigFile } from '../../../../../types';
import { spawn as _spawn } from 'child_process';
import { logger } from '../../../../../lib/logger';
import os from 'os';

// windows being windows... it wants the .cmd extension!
const pm2exec = os.platform() === 'win32' ? 'pm2.cmd' : 'pm2';

/**
 * Check for pm2 availability. Launche will be skipped if not available
 * @returns true or false
 */
async function checkPm2Availability(){

    // Quicker method: check for executable file
    if (os.platform() === 'win32'){
        // works on win32
        return fs.existsSync('C:\\Program Files\\nodejs\\'+pm2exec);
    }else if (fs.existsSync('/usr/bin/pm2')){
        // works on any linux/unix based distro
        return true;
    }
    
    // fallback slower method: run pm2 -v command and watch output
    try{
        const result = await spawn(pm2exec,['-v'], false);
        return (result.exitCode === 0) && (result.output.trim().length>0);
    }catch(e){
        return false;
    }
}

/**
 * Stop pm2 instances.
 * The process is detached so this cli can stop immediately without waiting for pm2 stop.
 */
export async function pm2stop() {
    const subprocess = _spawn(pm2exec, ['stop', 'all'], {
        detached: true,
        stdio: 'ignore'
    });
    subprocess.unref();
}

/**
 * Launch apps from pm2-dev-ecosystem config.
 * 
 * @param onitConfigFile 
 * @returns The number of app launched
 */
export async function pm2start(onitConfigFile: OnitConfigFile): Promise<number> {

    // preparo ecosystem file temporaneo
    const pm2Ecosystem: GenericObject = (onitConfigFile.json.serve || {})['pm2-dev-ecosystem'] ?? { apps: [] };

    // filter out apps based on enableOn
    pm2Ecosystem.apps = (pm2Ecosystem.apps || []).filter((app: GenericObject) => {
        let enabled = true;
        if (app.enableOn && (Object.keys(app.enableOn).length > 0)) {
            Object.keys(app.enableOn).forEach(v => {
                const value = _.get(pm2Ecosystem.environment, v, null);
                if (value !== app.enableOn[v]) {
                    enabled = false;
                }
            });
        }
        return enabled;
    });

    // c'è qualche app da lanciare?
    if (pm2Ecosystem.apps.length === 0) {
        logger.log('No PM2 apps to be launched. Skipping step.');
        return 0;
    }

    if (!await checkPm2Availability()){
        logger.warn('PM2 is not installed. Apps launch as defined in <pm2-dev-ecosystem> will be skipped');
        return 0;
    }

    const temporaryEcosystemFile = onitConfigFile.sources[0] + '-pm2-ecosystem.json';
    fs.writeFileSync(temporaryEcosystemFile, JSON.stringify(pm2Ecosystem, null, 4));

    // rimuovo ecosystem caricato in precedenza prima di rilanciare tutto
    await spawn(pm2exec, ['delete', 'all'], false);

    // pm2 delete all fatto. ora lancio ecosystem attuale
    await spawn(pm2exec, ['start', temporaryEcosystemFile], true);
    return pm2Ecosystem.apps.length;
}
