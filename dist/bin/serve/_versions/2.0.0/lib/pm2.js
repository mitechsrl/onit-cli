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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pm2start = exports.pm2stop = void 0;
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const spawn_1 = require("../../../../../lib/spawn");
const child_process_1 = require("child_process");
const logger_1 = require("../../../../../lib/logger");
const os_1 = __importDefault(require("os"));
/**
 * Uses the 'where' (on windows) or 'which' (on other os) command to search for pm2 executable directory
 *
 * @param expectedCommandEndsWith
 * @returns the command path or a nullish value for not found
 */
async function where(expectedCommandEndsWith) {
    let w = '';
    switch (os_1.default.platform()) {
        case 'win32':
            w = 'where';
            break;
        case 'linux':
            w = 'which';
            break;
        // Implement for other os if needed
        default: return undefined;
    }
    // Check with where command
    const v = await (0, spawn_1.spawn)(w, ['pm2'], false);
    // Not found
    if (v.exitCode !== 0)
        return undefined;
    // found, just store the bin path for future uses to be sure
    return v.output.split('\n').map(v => v.trim()).find(v => v.endsWith(expectedCommandEndsWith));
}
/**
 * Check for pm2 bin path.
 * @returns string or undefined
 */
async function getPm2BinPath() {
    switch (os_1.default.platform()) {
        case 'win32': {
            // Fastest method: standard install dir check
            const winPm2Base = 'C:\\Program Files\\nodejs\\pm2.cmd';
            if (fs_1.default.existsSync(winPm2Base)) {
                return winPm2Base;
            }
            // Check with where command
            return where('pm2.cmd');
        }
        case 'linux': {
            // check for other os (linux)
            const linuxPm2Base = '/usr/bin/pm2';
            // Fastest method: standard install dir check
            if (fs_1.default.existsSync(linuxPm2Base)) {
                return linuxPm2Base;
            }
            // Check with where command
            return where('pm2');
        }
        // Implement for other os if needed
        default: {
            logger_1.logger.warn('Pm2 availability check not implemented for ' + os_1.default.platform() + '. Skip pm2 management.');
            return undefined;
        }
    }
}
/**
 * Stop pm2 instances.
 * The process is detached so this cli can stop immediately without waiting for pm2 stop.
 */
async function pm2stop() {
    const pm2BinPath = await getPm2BinPath();
    if (!pm2BinPath) {
        logger_1.logger.warn('Pm2 stop not available. Pm2 executable not found');
        return;
    }
    const subprocess = (0, child_process_1.spawn)(pm2BinPath, ['stop', 'all'], {
        detached: true,
        stdio: 'ignore'
    });
    subprocess.unref();
}
exports.pm2stop = pm2stop;
/**
 * Launch apps from pm2-dev-ecosystem config.
 *
 * @param onitConfigFile
 * @returns The number of app launched
 */
async function pm2start(onitConfigFile) {
    var _a;
    const pm2BinPath = await getPm2BinPath();
    if (!pm2BinPath) {
        logger_1.logger.warn('PM2 is not installed. Apps launch as defined in <pm2-dev-ecosystem> will be skipped');
        return 0;
    }
    // preparo ecosystem file temporaneo
    const pm2Ecosystem = (_a = (onitConfigFile.json.serve || {})['pm2-dev-ecosystem']) !== null && _a !== void 0 ? _a : { apps: [] };
    // filter out apps based on enableOn
    pm2Ecosystem.apps = (pm2Ecosystem.apps || []).filter((app) => {
        let enabled = true;
        if (app.enableOn && (Object.keys(app.enableOn).length > 0)) {
            Object.keys(app.enableOn).forEach(v => {
                const value = lodash_1.default.get(pm2Ecosystem.environment, v, null);
                if (value !== app.enableOn[v]) {
                    enabled = false;
                }
            });
        }
        return enabled;
    });
    // c'è qualche app da lanciare?
    if (pm2Ecosystem.apps.length === 0) {
        logger_1.logger.log('No PM2 apps to be launched. Skipping step.');
        return 0;
    }
    const temporaryEcosystemFile = onitConfigFile.sources[0] + '-pm2-ecosystem.json';
    fs_1.default.writeFileSync(temporaryEcosystemFile, JSON.stringify(pm2Ecosystem, null, 4));
    // rimuovo ecosystem caricato in precedenza prima di rilanciare tutto
    await (0, spawn_1.spawn)(pm2BinPath, ['delete', 'all'], false);
    // pm2 delete all fatto. ora lancio ecosystem attuale
    await (0, spawn_1.spawn)(pm2BinPath, ['start', temporaryEcosystemFile], true);
    return pm2Ecosystem.apps.length;
}
exports.pm2start = pm2start;
//# sourceMappingURL=pm2.js.map