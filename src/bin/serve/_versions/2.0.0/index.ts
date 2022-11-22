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

import yargs from 'yargs';
import { GenericObject, OnitConfigFile } from '../../../../types';
import path from 'path';
import fs from 'fs';
import semver from 'semver';
import { logger } from '../../../../lib/logger';
import { spawnNodeProcessPromise } from './lib/spawnNodeProcess';
import { pm2start, pm2stop } from './lib/pm2';
import { processOnitConfigFileLinks } from './lib/link';
import { tscWatchAndRun } from './lib/tsc';
import { webpackDevBuildAndWatch } from './lib/webpack';

export async function start(onitConfigFile: OnitConfigFile, version:string, argv: yargs.ArgumentsCamelCase<unknown>) {
    // get the package json in the current directory
    const cwdPackageJsonPath= path.join(process.cwd(), 'package.json');
    const cwdPackageJson: GenericObject = JSON.parse(fs.readFileSync(cwdPackageJsonPath).toString());

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

    const minusW = argv.w;
    const minusT = argv.t;
    const minusN = argv.n;
    const debug = argv.debug;

    let launchedCount = 0;

    logger.log('Checking links...');
    await processOnitConfigFileLinks(onitConfigFile);

    if (minusN || (!(minusW || minusT))) {
        logger.log('Checking pm2 apps...');
        launchedCount = await pm2start(onitConfigFile);
    }

    if (minusW) {
        logger.log('Launching webpack...');
        await webpackDevBuildAndWatch(onitConfigFile, cwdPackageJson, argv);
    } else if (minusT) {
        logger.log('Launching tsc...');
        await tscWatchAndRun(onitConfigFile, argv);
    } else if (minusN) {
        logger.warn('Launching node...');
        const nodeParams = [];
        if (debug) {
            logger.warn('Setup node debug flags --inspect --preserve-symlinks');
            nodeParams.push('--inspect');
            nodeParams.push('--preserve-symlinks');
        }
        await spawnNodeProcessPromise(onitConfigFile, onitConfigFile.json.serve!, argv, nodeParams);
    } else {
        logger.log('Launching webpack+tsc...');
        await Promise.all([
            webpackDevBuildAndWatch(onitConfigFile, cwdPackageJson, argv),
            tscWatchAndRun(onitConfigFile, argv)
        ]);
    }

    if (launchedCount > 0) {
        // after-serve: run sequentially waiting for each async resolve
        logger.log('Shutting down pm2...');
        await pm2stop();
    }

    // bye!
    logger.error('Exiting serve, bye! :wave:');
    // eslint-disable-next-line no-process-exit
    process.exit(0);
}
