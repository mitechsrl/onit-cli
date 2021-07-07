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

const pm2Dev = require('./lib/pm2');
const nodemon = require('./lib/nodemon');
const webpack = require('./lib/webpack');
const links = require('./lib/link');

module.exports.start = async function (onitServeFile, version, basepath, params, logger) {
    const minusW = params.get('-w').found;
    const minusN = params.get('-n').found;
    const debug = params.get('-debug').found;
    const reload = params.get('-reload').found;
    try {
        logger.log('Verifico links...');
        await links.start(logger, onitServeFile);

        // pre-serve: run sequentially waiting for each async resolve
        logger.log('Eseguo <Nodemon startup>...');
        const launchedCount = await pm2Dev.start(onitServeFile);

        // tempo di lanciare il serve effettivo
        const message = [(!minusN ? 'webpack' : ''), (!minusW ? 'nodemon' : '')].filter(m => !!m).join(' e ');
        logger.log('Lancio ' + message + '...');

        await Promise.all([
            (!minusN) ? webpack.start(logger, onitServeFile) : Promise.resolve(), // -n cause only webpack to be run live
            (!minusW) ? nodemon.start(logger, onitServeFile, debug, reload, minusN ? 0 : 10000) : Promise.resolve() // -w cause only webpack to be run live
        ]);

        if (launchedCount > 0) {
            // after-serve: run sequentially waiting for each async resolve
            logger.log('Eseguo <Nodemon shutdown>...');
            await pm2Dev.stop();
        }
        // bye!
        logger.error('Exit serve...');
        // eslint-disable-next-line no-process-exit
        process.exit(0);
    } catch (e) {
        logger.error(e.message);
        logger.error('Run interrotto');
        // eslint-disable-next-line no-process-exit
        process.exit(-1);
    }
};
