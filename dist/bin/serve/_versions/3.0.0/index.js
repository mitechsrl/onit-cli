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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const semver_1 = __importDefault(require("semver"));
const logger_1 = require("../../../../lib/logger");
const pm2_1 = require("../2.0.0//lib/pm2");
const tsc_1 = require("../2.0.0/lib/tsc");
const webpack_1 = require("../2.0.0/lib/webpack");
const onitConfigFileEngines_1 = require("../../../../lib/onitConfigFileEngines");
const nextjs_1 = require("../../../build/_versions/3.0.0/lib/nextjs");
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
    const frontendServe = argv.w || argv.f; // w stands for 'webpack', f for 'frontend'
    const backendServe = argv.t || argv.b; // t stands for 'tsc', b for 'backend'
    let launchedCount = 0;
    const exit = argv.exit;
    // pm2 will be launched only when node is explicitly launched on when none of the other partial serve flags are set
    const launchPm2 = !(backendServe || frontendServe);
    if (launchPm2) {
        logger_1.logger.log('Checking pm2 apps...');
        launchedCount = await (0, pm2_1.pm2start)(onitConfigFile);
    }
    // helper method to select which stuff to be launched
    const _s = async () => {
        // serialPromises must be run and waited first
        const serialPromises = [];
        // parallelPromises will be run after all serialPromises ends
        const parallelPromises = [];
        const _createFrontendPromises = (isFrontendRunOnly) => {
            const frontendEngines = (0, onitConfigFileEngines_1.getConfigFileFrontendEngine)(onitConfigFile);
            Object.keys(frontendEngines).forEach((_key) => {
                const key = _key;
                if (!frontendEngines[key])
                    return;
                switch (key) {
                    case 'nextjs': {
                        // nextjs serve launches a 3rd party cli.
                        // adding it on serialPromises so we will launch it before all the other stuff
                        //
                        // NOTE: this can be skipped if node will be lunched. Nextjs perform a dev build automatically on app boot
                        // isFrontendRunOnly = true => must run (no later node launch)
                        // isFrontendRunOnly = false => check if node will be launched.
                        //    It happens only if exit is not set, (which will have caused cause the tsc compiler to exit before launching node)
                        if (isFrontendRunOnly || exit) {
                            serialPromises.push(() => {
                                logger_1.logger.log('Serving nextjs...');
                                return (0, nextjs_1.nextJsBuild)(onitConfigFile, cwdPackageJson, 'development', argv);
                            });
                        }
                        break;
                    }
                    case 'onit-webpack': {
                        parallelPromises.push(() => {
                            logger_1.logger.log('Serving onit-webpack...');
                            return (0, webpack_1.webpackDevBuildAndWatch)(onitConfigFile, cwdPackageJson, argv);
                        });
                        break;
                    }
                }
            });
        };
        const _createBackendPromises = () => {
            const backendEngines = (0, onitConfigFileEngines_1.getConfigFileBackendEngine)(onitConfigFile);
            Object.keys(backendEngines).forEach((_key) => {
                const key = _key;
                if (!backendEngines[key])
                    return;
                switch (key) {
                    case 'lb4': {
                        parallelPromises.push(() => {
                            logger_1.logger.log('Serving lb4...');
                            return (0, tsc_1.tscWatchAndRun)(onitConfigFile, cwdPackageJson, argv);
                        });
                        break;
                    }
                }
            });
        };
        // the frontend partial serve flag was set. Launch it
        if (frontendServe && !backendServe) {
            _createFrontendPromises(true);
        }
        // the backend partial serve flag was set. Launch it
        if (!frontendServe && backendServe) {
            _createBackendPromises();
        }
        const launchAll = 
        // Both partial flags were set. This is an unusual config, since i'ts equal to launch everything
        (frontendServe && backendServe) ||
            // none of the partial flags was set. This means we must launch everything
            (!frontendServe && !backendServe);
        if (launchAll) {
            _createFrontendPromises(false);
            _createBackendPromises();
        }
        // launch serialPromises one by one sequantally
        for (const p of serialPromises) {
            await p();
        }
        // launch all parallelPromises together
        await Promise.all(parallelPromises.map(p => p()));
    };
    // launch the serve helper functin
    await _s();
    // shutdown pm2 if needed
    if (launchedCount > 0) {
        logger_1.logger.log('Shutting down pm2...');
        await (0, pm2_1.pm2stop)();
    }
    // bye!
    logger_1.logger.success('Exiting serve, bye! :wave:');
    // eslint-disable-next-line no-process-exit
    // process.exit(0);
}
exports.start = start;
//# sourceMappingURL=index.js.map