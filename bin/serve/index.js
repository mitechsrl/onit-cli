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

const onitFileLoader = require('../../lib/onitFileLoader');
const fs = require('fs');
const path = require('path');
const semverMaxSatisfying = require('semver/ranges/max-satisfying');
const logger = require('../../lib/logger');

module.exports.info = 'Dev Run/serve utility. Lancia il progetto in ambiente di sviluppo';
module.exports.help = [

    'Serve V^1.0.0',
    ['-n', 'Esegui solo nodemon, skip webpack'],
    ['-reload', 'Abbinato a -debug, avvia il processo node con watch&reload.'],
    '', 'Serve V^2.0.0',
    ['-t', 'Esegui tsc e node'],
    ['-n', 'Esegui solo il processo node (Necessita di tsc eseguito almeno una volta)'],
    ['-w', 'Abbinato a -t, esegue solo il watch&build senza lanciare node'],
    ['-exit', 'Abbinato a -t esce subito dopo aver terminato tsc'],
    ['-dangerouslyenablesmtpserver', 'Abilita env EMAIL_SERVER. Usa con cautela'],
    '', 'Comuni',
    ['-w', 'Esegui solo webpack'],
    ['-c serveFile', 'Utilizza il file di serve specificato'],
    ['-debug', 'Avvia il processo node con il flag --inspact']

];

module.exports.cmd = async function (basepath, params) {
    try {
        // check for manual serve file specifed
        const manualConfigFile = params.get('-c');

        // load the buildFile
        const onitConfigFile = await onitFileLoader.load(process.cwd(), manualConfigFile.found ? manualConfigFile.value : null);
        logger.warn('Uso file(s) config ' + onitConfigFile.sources.join(', '));

        if (!onitConfigFile.json.serve) {
            throw new Error('Il serve non è disponibile. Verifica di avere la proprietà <serve> nel file di configurazioen di onit.');
        }
        // lock to the required builder version or get the most recent one
        const requiredVersion = onitConfigFile.json.serve.version || onitConfigFile.json.version || '*';

        // get a list of the available versions (each dir describe one version)
        const availableVersions = fs.readdirSync(path.join(__dirname, './_src'));

        // use npm semver to select the most recent usable version
        const version = semverMaxSatisfying(availableVersions, requiredVersion);

        if (!version) throw new Error('Nessuna versione di serve compatibile con ' + requiredVersion + ' trovata. Verifica il valore serve.version del tuo file onitserve oppure aggiorna onit-cli');

        // version found: Load that builder and use it.
        logger.info('Uso serve V' + version);
        const serve = require(path.join(__dirname, './_src/' + version + '/index.js'));

        // autoset the hardcoded params
        if (Array.isArray(onitConfigFile.json.serve.params)) {
            params.push(...onitConfigFile.json.serve.params);
        }

        await serve.start(onitConfigFile, version, basepath, params);
    } catch (e) {
        logger.error('Serve interrotto');
        throw e;
    }
};
