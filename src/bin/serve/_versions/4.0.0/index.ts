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
import { GenericObject, OnitConfigFile, OnitConfigFileEngineBackend, OnitConfigFileEngineFrontend } from '../../../../types';
import path from 'path';
import fs from 'fs';
import semver from 'semver';
import { logger } from '../../../../lib/logger';
import { pm2start, pm2stop } from '../2.0.0/lib/pm2';
import { tscWatchAndRun } from '../2.0.0/lib/tsc';
import { webpackDevBuildAndWatch } from '../2.0.0/lib/webpack';
import { getConfigFileBackendEngine, getConfigFileFrontendEngine } from '../../../../lib/onitConfigFileEngines';
import { nextJsBuild } from '../../../build/_versions/3.0.0/lib/nextjs';
import { assertPackageLockPotentialConflicts } from '../3.0.0/lib/checkPackageLockPotentialConflicts';

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

    const frontendServe = argv.w || argv.f; // w stands for 'webpack', f for 'frontend'
    const backendServe = argv.t || argv.b; // t stands for 'tsc', b for 'backend'
    let launchedCount = 0;
    const exit = argv.exit;
  
    if (onitConfigFile.json?.serve?.checkPackageLockPotentialConflicts !== false) {
        // Preemptive checks for out needs: we got burnt when npm installed different versions of the same package
        // in different packages in npm workspaces. This check alert us this behavior does not slip under the
        // door unnoticed.
        // The ckeck is enabled by default. (set serve.checkPackageLockPotentialConflicts = false in onit.config.json to disable it)
        await assertPackageLockPotentialConflicts(onitConfigFile);
    }
    // pm2 will be launched only when node is explicitly launched on when none of the other partial serve flags are set
    const launchPm2 = !(backendServe || frontendServe); 
    if (launchPm2) {
        logger.log('Checking pm2 apps...');
        launchedCount = await pm2start(onitConfigFile);
    }

    // helper method to select which stuff to be launched
    const _s = async () => {
        // serialPromises must be run and waited first
        const serialPromises: (() => Promise<unknown>)[] = [];
        // parallelPromises will be run after all serialPromises ends
        const parallelPromises: (() => Promise<unknown>)[] = [];

        const _createFrontendPromises = (isFrontendRunOnly: boolean) => {
            const frontendEngines = getConfigFileFrontendEngine(onitConfigFile);
            Object.keys(frontendEngines).forEach((_key: string) => {

                const key = _key as keyof OnitConfigFileEngineFrontend;
                if (!frontendEngines[key]) return;

                switch(key){
                case 'nextjs': {
                    // nextjs serve launches a 3rd party cli.
                    // adding it on serialPromises so we will launch it before all the other stuff
                    //
                    // NOTE: this can be skipped if node will be lunched. Nextjs perform a dev build automatically on app boot
                    // isFrontendRunOnly = true => must run (no later node launch)
                    // isFrontendRunOnly = false => check if node will be launched.
                    //    It happens only if exit is not set, (which will have caused cause the tsc compiler to exit before launching node)
                    if (isFrontendRunOnly || exit){
                        serialPromises.push(() => {
                            logger.log('Serving nextjs...');
                            return nextJsBuild(
                                onitConfigFile, 
                                cwdPackageJson, 
                                'production', 
                                onitConfigFile.json.serve?.environment ?? {
                                }, 
                                argv);
                        });
                    }
                    break;
                }
                case 'onit-webpack': {
                    parallelPromises.push(() => {
                        logger.log('Serving onit-webpack...');
                        return webpackDevBuildAndWatch(onitConfigFile, cwdPackageJson, argv);
                    });
                    break;
                }
                }
            });
        };

        const _createBackendPromises = () => {
            const backendEngines = getConfigFileBackendEngine(onitConfigFile);
            Object.keys(backendEngines).forEach((_key: string) => {

                const key = _key as keyof OnitConfigFileEngineBackend;
                if (!backendEngines[key]) return;
                
                switch(key){
                case 'lb4': {
                    parallelPromises.push(() => {
                        logger.log('Serving lb4...');
                        return tscWatchAndRun(onitConfigFile, cwdPackageJson, argv);
                    });
                    break;
                }
                }
                
            });
        };

        // the frontend partial serve flag was set. Launch it
        if (frontendServe && !backendServe){
            _createFrontendPromises(true);
        }

        // the backend partial serve flag was set. Launch it
        if (!frontendServe && backendServe){
            _createBackendPromises();
        }

        const launchAll = 
            // Both partial flags were set. This is an unusual config, since i'ts equal to launch everything
            (frontendServe && backendServe) ||
            // none of the partial flags was set. This means we must launch everything
            (!frontendServe && !backendServe);
       
        if (launchAll){
            _createFrontendPromises(false);
            _createBackendPromises();
        }

        // launch serialPromises one by one sequantally
        for(const p of serialPromises){
            await p();
        }

        // launch all parallelPromises together
        await Promise.all(parallelPromises.map(p => p()));
        
    };

    // launch the serve helper functin
    await _s();

    // shutdown pm2 if needed
    if (launchedCount > 0) {
        logger.log('Shutting down pm2...');
        await pm2stop();
    }

    // bye!
    logger.log('Completed at '+new Date().toLocaleTimeString());
    logger.success('Exiting serve, bye! :wave:');
    // eslint-disable-next-line no-process-exit
    // process.exit(0);
}
