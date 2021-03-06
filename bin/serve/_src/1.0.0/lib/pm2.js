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

const fs = require('fs');
const _ = require('lodash');
const spawn = require('../../../../../lib/spawn');

// windows fa il windows percui lui vuole 'pm2.cmd' anzichè 'pm2' come comando di avvio
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');
const pm2exec = isWindows ? 'pm2.cmd' : 'pm2';

module.exports.stop = async function () {
    return spawn(pm2exec, ['stop', 'all'], true);
};

module.exports.start = async function (onitConfigFile) {
    // preparo ecosystem file temporaneo
    let pm2Ecosystem = (onitConfigFile.json.serve || {})['pm2-dev-ecosystem'];
    if (!pm2Ecosystem) {
        pm2Ecosystem = { apps: [] };
    }

    // filter out apps based on enableOn
    pm2Ecosystem.apps = (pm2Ecosystem.apps || []).filter(app => {
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
        console.log('Nessuna app da lanciare con PM2. Skip passaggio');
        return 0;
    }

    const temporaryEcosystemFile = onitConfigFile.sources[0] + '-pm2-ecosystem.json';
    fs.writeFileSync(temporaryEcosystemFile, JSON.stringify(pm2Ecosystem, null, 4));

    // rimuovo ecosystem caricato in precedenza prima di rilanciare tutto
    await spawn(pm2exec, ['delete', 'all'], false);

    // pm2 delete all fatto. ora lancio ecosystem attuale
    await spawn(pm2exec, ['start', temporaryEcosystemFile], true);
    return pm2Ecosystem.apps.length;
};
