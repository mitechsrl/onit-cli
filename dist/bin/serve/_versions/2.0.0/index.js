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
exports.start = void 0;
/*
const pm2Dev = require('./lib/pm2');
const webpack = require('./lib/webpack');
const tsc = require('./lib/tscWatch.js');
const links = require('../../../../shared/1.0.0/lib/link');
*/
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const semver_1 = __importDefault(require("semver"));
const logger_1 = require("../../../../lib/logger");
const spawnNodeProcess_1 = require("./lib/spawnNodeProcess");
const pm2_1 = require("./lib/pm2");
const link_1 = require("./lib/link");
const tsc_1 = require("./lib/tsc");
const webpack_1 = require("./lib/webpack");
async function start(onitConfigFile, version, argv) {
    // get the package json in the current directory
    const cwdPackageJsonPath = path_1.default.join(process.cwd(), 'package.json');
    const cwdPackageJson = JSON.parse(fs_1.default.readFileSync(cwdPackageJsonPath).toString());
    // check node run version
    // as developers, we maintain different projects which uses different node versions
    // Sometimes we forgot we are on oder versions which are incompatible.
    // This at least save us to random errors which may appear on incompatible versions.
    if ((cwdPackageJson.engines || {}).node) {
        if (!semver_1.default.satisfies(process.version, cwdPackageJson.engines.node)) {
            throw new Error('App requires node ' + cwdPackageJson.engines.node + ', but you are using ' + process.version);
        }
    }
    // SMTP_SERVER warning
    if (process.argv.find(v => v.toLowerCase() === '-dangerouslyenablesmtpserver')) {
        logger_1.logger.warn(':warning:  --------------------------------- WARNING --------------------------------- :warning:');
        logger_1.logger.warn(':warning:  You have used the flag dangerouslyenablesmtpserver.                         :warning:');
        logger_1.logger.warn(':warning:  Smtp server evironment variable is enabled. If you provided a valid server, :warning:');
        logger_1.logger.warn(':warning:  queued and new mails can be sent for real.                                  :warning:');
        logger_1.logger.warn(':warning:  --------------------------------------------------------------------------- :warning:');
        logger_1.logger.warn('');
        logger_1.logger.warn('Resuming serve in 10 seconds. If you don\'t want this, press ctrl+c now!');
        logger_1.logger.warn('   ');
        await new Promise(resolve => {
            setTimeout(resolve, 10000);
        });
    }
    const minusW = argv.w;
    const minusT = argv.t;
    const minusN = argv.n;
    const debug = argv.debug;
    let launchedCount = 0;
    logger_1.logger.log('Checking links...');
    await (0, link_1.processOnitConfigFileLinks)(onitConfigFile);
    if (minusN || (!(minusW || minusT))) {
        logger_1.logger.log('Verifico app da lanciare con pm2...');
        launchedCount = await (0, pm2_1.pm2start)(onitConfigFile);
    }
    if (minusW) {
        logger_1.logger.log('Lancio webpack...');
        await (0, webpack_1.webpackDevBuildAndWatch)(onitConfigFile, cwdPackageJson, argv);
    }
    else if (minusT) {
        logger_1.logger.log('Lancio tsc...');
        await (0, tsc_1.tscWatchAndRun)(onitConfigFile, argv);
    }
    else if (minusN) {
        logger_1.logger.warn('Lancio node...');
        const nodeParams = [];
        if (debug) {
            logger_1.logger.warn('Modalità debug abilitata');
            nodeParams.push('--inspect');
            nodeParams.push('--preserve-symlinks');
            nodeParams.push('--preserve-symlinks-main');
        }
        await (0, spawnNodeProcess_1.spawnNodeProcessPromise)(onitConfigFile, onitConfigFile.json.serve, argv, nodeParams);
    }
    else {
        logger_1.logger.log('Lancio webpack e tsc...');
        await Promise.all([
            (0, webpack_1.webpackDevBuildAndWatch)(onitConfigFile, cwdPackageJson, argv),
            (0, tsc_1.tscWatchAndRun)(onitConfigFile, argv)
        ]);
    }
    if (launchedCount > 0) {
        // after-serve: run sequentially waiting for each async resolve
        logger_1.logger.log('Eseguo shutdown pm2');
        await (0, pm2_1.pm2stop)();
    }
    // bye!
    logger_1.logger.error('Exit serve...');
    // eslint-disable-next-line no-process-exit
    process.exit(0);
}
exports.start = start;
//# sourceMappingURL=index.js.map