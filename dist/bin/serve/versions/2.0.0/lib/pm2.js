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
// windows fa il windows percui lui vuole 'pm2.cmd' anzichè 'pm2' come comando di avvio
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');
const pm2exec = isWindows ? 'pm2.cmd' : 'pm2';
/**
 * Check for pm2 availability. Launche will be skipped if not available
 * @returns true or false
 */
async function checkPm2Availability() {
    let pm2Path = '';
    // quickest way: check for pm2 file command available
    // FIXME: add linux case
    if (isWindows)
        pm2Path = 'C:\\Program Files\\nodejs\\' + pm2exec;
    if (pm2Path && fs_1.default.existsSync(pm2Path))
        return true;
    // slower method: run pm2 -v command and watch output
    try {
        const result = await (0, spawn_1.spawn)(pm2exec, ['-v'], false);
        return result.output.trim().length > 0;
    }
    catch (e) {
        return false;
    }
}
async function pm2stop() {
    // launch this detached so the cli can exit quickly while pm2 is still stopping apps
    const subprocess = (0, child_process_1.spawn)(pm2exec, ['stop', 'all'], {
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
    if (!await checkPm2Availability()) {
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
        console.log('No pm2 apps to be launched. Skipping step.');
        return 0;
    }
    const temporaryEcosystemFile = onitConfigFile.sources[0] + '-pm2-ecosystem.json';
    fs_1.default.writeFileSync(temporaryEcosystemFile, JSON.stringify(pm2Ecosystem, null, 4));
    // rimuovo ecosystem caricato in precedenza prima di rilanciare tutto
    await (0, spawn_1.spawn)(pm2exec, ['delete', 'all'], false);
    // pm2 delete all fatto. ora lancio ecosystem attuale
    await (0, spawn_1.spawn)(pm2exec, ['start', temporaryEcosystemFile], true);
    return pm2Ecosystem.apps.length;
}
exports.pm2start = pm2start;
//# sourceMappingURL=pm2.js.map