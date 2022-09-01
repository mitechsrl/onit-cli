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
const webpack = require('./lib/webpack');
const tsc = require('./lib/tscWatch.js');
const links = require('../../../../shared/1.0.0/lib/link');
const { spawnNodeProcessPromise } = require('./lib/spawnNodeProcess');
const logger = require('../../../../lib/logger');
const path = require('path');
const fs = require('fs');
const semver = require('semver');

module.exports.start = async function (onitConfigFile, version, basepath, params) {
    // get the package json in the current directory
    let cwdPackageJson = path.join(process.cwd(), 'package.json');
    cwdPackageJson = JSON.parse(fs.readFileSync(cwdPackageJson).toString());

    // check node run version
    // as developers, we maintain different projects which uses different node versions
    // Sometimes we forgot we are on oder versions which are incompatible.
    // This at least save us to random errors which may appear on incompatible versions.
    if ((cwdPackageJson.engines || {}).node) {
        if (!semver.satisfies(process.version, cwdPackageJson.engines.node)) {
            throw new Error('App requires node ' + cwdPackageJson.engines.node + ', but you are using ' + process.version);
        }
    }

    // SMTP_SERVER warning
    if (process.argv.find(v => v.toLowerCase() === '-dangerouslyenablesmtpserver')) {
        logger.warn(':warning:  --------------------------------- WARNING --------------------------------- :warning:');
        logger.warn(':warning:  You have used the flag dangerouslyenablesmtpserver.                         :warning:');
        logger.warn(':warning:  Smtp server evironment variable is enabled. If you provided a valid server, :warning:');
        logger.warn(':warning:  queued and new mails can be sent for real.                                  :warning:');
        logger.warn(':warning:  --------------------------------------------------------------------------- :warning:');
        logger.warn('');
        logger.warn('Resuming serve in 10 seconds. If you don\'t want this, press ctrl+c now!');
        logger.warn('   ');

        await new Promise(resolve => {
            setTimeout(resolve, 10000);
        });
    }

    const minusW = params.get('-w').found;
    const minusT = params.get('-t').found;
    const minusN = params.get('-n').found;

    const debug = params.get('-debug').found;
    // const reload = params.get('-reload').found;
    let launchedCount = 0;

    logger.log('Verifico links...');
    await links.start(onitConfigFile);

    if (minusN || (!(minusW || minusT))) {
        logger.log('Verifico app da lanciare con pm2...');
        launchedCount = await pm2Dev.start(onitConfigFile);
    }

    if (minusW) {
        logger.log('Lancio webpack...');
        await webpack.start(onitConfigFile, cwdPackageJson, params);
    } else if (minusT) {
        logger.log('Lancio tsc...');
        await tsc.start(onitConfigFile, params);
    } else if (minusN) {
        logger.warn('Lancio node...');
        const nodeParams = [];
        if (debug) {
            logger.warn('Modalità debug abilitata');
            nodeParams.push('--inspect');
            nodeParams.push('--preserve-symlinks');
            nodeParams.push('--preserve-symlinks-main');
        }
        await spawnNodeProcessPromise(onitConfigFile, nodeParams);
    } else {
        logger.log('Lancio webpack e tsc...');
        await Promise.all([
            webpack.start(onitConfigFile, cwdPackageJson, params),
            tsc.start(onitConfigFile, params)
        ]);
    }

    if (launchedCount > 0) {
        // after-serve: run sequentially waiting for each async resolve
        logger.log('Eseguo shutdown pm2');
        await pm2Dev.stop();
    }

    // bye!
    logger.error('Exit serve...');
    // eslint-disable-next-line no-process-exit
    process.exit(0);
};
