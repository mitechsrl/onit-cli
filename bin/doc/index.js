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

const logger = require('../../lib/logger');
const onitFileLoader = require('../../lib/onitFileLoader');
const { generate } = require('./_src/generate');

module.exports.info = 'Utility generazione documentazione. WARNING: questa funzionalit√† √® sperimentale';
module.exports.help = [
    'Esegue la generazione della documentazione partendo dalla directory corrente',
    ['-o', 'Output path. Default ./onit-docs']
];

module.exports.cmd = async function (basepath, params) {
    try {
        // check for manual serve file specifed
        const outputPath = params.get('-o');

        // load the buildFile
        const config = await onitFileLoader.load(process.cwd(), 'onitdocumentation.config');
        if (!config) throw new Error('File onitdocumentation.config.[js|json] non trovato');
        logger.warn('Uso file configurazione ' + config.sources.join(', '));

        await generate(config.json, outputPath);
    } catch (e) {
        logger.error(e);
        // eslint-disable-next-line no-process-exit
        process.exit(-1);
    }
};
