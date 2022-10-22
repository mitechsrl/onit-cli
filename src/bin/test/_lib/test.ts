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

import { logger } from "../../../lib/logger";
import { OnitConfigFile, OnitConfigFileTestTarget } from "../../../types";


/**
 *
 * @param {*} onitConfigFile
 * @param {*} testTarget
 */
async function onitProcessLauncher (onitConfigFile: OnitConfigFile, testTarget: OnitConfigFileTestTarget) {
    // find the main onit js file
    const mainFile = getMainExecutableFilePath(onitConfigFile, testTarget);
    // Require onit and launch it
    const onit = require(path.join(process.cwd(), mainFile));
    const onitInstance = await onit.launch();

    // wait just some seconds to allow all async stuff to be initialized
    await new Promise(resolve => setTimeout(resolve, 4000));

    return {
        onit: onitInstance,
        // callback to stop onit
        stop: () => {
            return new Promise(resolve => {
                onitInstance.lbApp.onStop(() => {
                    setTimeout(() => {
                        resolve();
                    }, 2000);
                });
                onitInstance.stop(false);
            });
        }
    };
}
/**
 * Main starter function
 *
 * @param {*} onitConfigFile onitconfig file
 * @param {*} testTarget Test config
 * @param {*} basepath
 * @param {*} params cli unmanaged params
 */
module.exports.start = async (onitConfigFile:OnitConfigFile, testTarget: OnitConfigFileTestTarget, basepath: string, params: ) => {
    try {
        const doNotRebuild = params.get('--no-rebuild').found;
        if (doNotRebuild) {
            logger.log('');
            logger.warn('Be sure all your code is compiled!');
            logger.log('');
        }
        const runningPath = process.cwd();

        // get the mocha instance from the target workspace
        const Mocha = requireMochaFromProcessCwd();
        if (!Mocha) {
            throw new Error('Cannot find a local instance of mocha. Please add the dependency @mitech/onit-dev-tools.');
        }

        // do not recompile

        if (!doNotRebuild) {
            logger.info('Cleaning project build...');
            await spawnPromise(npmExecutable, ['run', 'clean'], true);
            logger.info('Building project...');
            await spawnPromise(onitExecutable, ['serve', '-t', '-exit'], true);
        }

        let testEnvironment = {
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
        process.env = buildEnvironment(onitConfigFile, testTarget);

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
        global.testEnvironment = testEnvironment;

        // run now mocha and wait for result
        const testCaseFiles = await resolveTestFilesDirectories(testTarget);
        const mochaResult = await runMocha(testTarget, Mocha, testCaseFiles);

        if (onitInstance) {
        // stop the onit process
            logger.log('Stopping onit...');
            await onitInstance.stop();
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
        printError(e);
        logger.error('Test failed!');
        return;
    }

    logger.info('Test success!');
};
