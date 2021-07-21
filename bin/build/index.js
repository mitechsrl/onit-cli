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
const path = require('path');
const fs = require('fs');
const semverMaxSatisfying = require('semver/ranges/max-satisfying');

module.exports.info = 'Build utility. Compila il progetto in un pacchetto pronto per il deploy';
module.exports.help = [];

module.exports.cmd = async function (basepath, params, logger) {
    try {
        // check for manual serve file specifed
        const manualConfigFile = params.get('-c');

        // load the buildFile
        const onitConfigFile = await onitFileLoader.load(process.cwd(), manualConfigFile.found ? manualConfigFile.value : null);
        logger.warn('Uso file(s) config ' + onitConfigFile.sources.join(', '));

        // lock to the required builder version or get the most recent one
        const requiredVersion = onitConfigFile.json.builderVersion || '*';

        // load the available build versions
        const availableVersions = fs.readdirSync(path.join(__dirname, './_src'));

        // use npm semver to select the most recent usable version
        const version = semverMaxSatisfying(availableVersions, requiredVersion);

        if (!version) throw new Error('Nessuna versione builder compatibile con ' + requiredVersion + ' trovata. Verifica il valore buildVersion del tuo file onitBuild oppure aggiorna onit-cli');

        // version found: Load that builder and use it.
        logger.info('Uso builder V' + version);
        const builder = require(path.join(__dirname, './_src/' + version + '/index.js'));

        await builder.start(onitConfigFile, version, basepath, params, logger);
    } catch (e) {
        logger.error('Build interrotto');
        throw e;
    }
};
