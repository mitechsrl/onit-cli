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

import { GenericObject, OnitConfigFile, OnitConfigFileTestTarget, StringError } from '../../../types';
import yargs from 'yargs';
import { logger } from '../../../lib/logger';
import { requireMochaFromProcessCwd } from './requireMochaFromProcessCwd';
import { onitProcessLauncher } from './onitProcessLauncher';
import { spawn } from '../../../lib/spawn';
import { npm } from '../../../lib/npm';
import { checkFiles } from './checkFiles';
import { buildEnvironment } from '../../serve/_versions/2.0.0/lib/spawnNodeProcess';
import { resolveTestFilesDirectories } from './resolveTestFilesDirectories';
import { runMocha } from './runMocha';
import os from 'os';

// windows being windows... it wants the .cmd extension!
const onitCliExecutable = os.platform()=== 'win32' ? 'onit.cmd' : 'onit';

/**
 * Test starter method
 * 
 * @param onitConfigFile onitconfig file
 * @param testTarget Test config
 * @param argv  cli params
 */
export async function startTest(
    onitConfigFile: OnitConfigFile, 
    testTarget: OnitConfigFileTestTarget, 
    argv: yargs.ArgumentsCamelCase<unknown>): Promise<number>{
    try {
        const doNotRebuild = argv['no-rebuild'];
        if (doNotRebuild) {
            logger.log('');
            logger.warn('Be sure all your code is compiled!');
            logger.log('');
        }
        const runningPath = process.cwd();

        // get the mocha instance from the target workspace
        const Mocha = requireMochaFromProcessCwd();
    
        // do not recompile

        if (!doNotRebuild) {
            logger.info('Cleaning project build...');
            await npm(['run', 'clean']);
            logger.info('Building project...');
            const buildTscResult = await spawn(onitCliExecutable, ['serve', '-t', '--exit'], { shell:true });
            if (buildTscResult.exitCode !== 0) throw new StringError('Tsc build failed. Aborting test');
            const buildFrontendResult = await spawn(onitCliExecutable, ['serve', '-w', '--exit'], { shell:true });
            if (buildFrontendResult.exitCode !== 0) throw new StringError('Frontend build failed. Aborting test');
        }

        let testEnvironment: GenericObject = {
            env: testTarget.environment
        };

        const requires = checkFiles(testTarget, runningPath);

        // file existance checked. Run them
        // startup must run before anything else.
        if (requires.startup) {
            logger.log('Launch startup script...');
            try {
                testEnvironment = (await requires.startup.startup(testEnvironment)) || testEnvironment;
            } catch (e) {
                logger.error('Startup script failed.');
                throw e;
            }
        }

        // IV 22-09-2022: mosso DOPO startup script perchè cosi lo stesso può
        // modificare l'environment se necessario
        
        // create the proces.env object to be set in order to pass values to onit
        testTarget.environment = testEnvironment.env;
        process.env = buildEnvironment(onitConfigFile, testTarget, argv);

        let onitInstance = null;

        // start onit.
        if (testTarget.launchOnit !== false) {
            logger.log('Launching onit...');
            try {
                onitInstance = await onitProcessLauncher(onitConfigFile, testTarget);
            } catch (e) {
                logger.error('Launch of onit process failed.');
                throw e;
            }
            testEnvironment.onit = onitInstance.onit;
        }

        // beforeTest must run after onit launch.
        if (requires.beforeTest) {
            logger.log('Launch beforeTest script ...');
            try {
                testEnvironment = await requires.beforeTest.beforeTest(testEnvironment);
            } catch (e) {
                logger.error('beforeTest script failed.');
                throw e;
            }
        }

        // set the testEnvironemtn as global so from now on it can be accessible
        // @ts-expect-error forcing setting this in glbal
        global.testEnvironment = testEnvironment;

        // run now mocha and wait for result
        const testCaseFiles = await resolveTestFilesDirectories(testTarget);
        const mochaResult = await runMocha(testTarget, Mocha, testCaseFiles);

        if (onitInstance) {
            // stop the onit process
            logger.log('Stopping onit...');
            await onitInstance.stop();
            console.log('Stop executed');
        }

        // tests are finished. Run the shutdown script if any
        if (requires.shutdown) {
            logger.log('Launch shutdown script...');
            try {
                await requires.shutdown.shutdown(testEnvironment, mochaResult);
            } catch (e) {
                logger.error('shutdown script failed.');
                throw e;
            }
        }

        if (mochaResult.exitCode !== 0) {
            throw new Error('Mocha report some tests are failed');
        }
    } catch (e) {
        logger.error('Catched error');
        logger.error(e);
        logger.error('Test Failed!');
        return -1;
    }

    logger.info('Test success!');
    return 0;
}
