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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTest = void 0;
const logger_1 = require("../../../lib/logger");
const requireMochaFromProcessCwd_1 = require("./requireMochaFromProcessCwd");
const onitProcessLauncher_1 = require("./onitProcessLauncher");
const spawn_1 = require("../../../lib/spawn");
const npm_1 = require("../../../lib/npm");
const checkFiles_1 = require("./checkFiles");
const spawnNodeProcess_1 = require("../../serve/versions/2.0.0/lib/spawnNodeProcess");
const resolveTestFilesDirectories_1 = require("./resolveTestFilesDirectories");
const runMocha_1 = require("./runMocha");
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');
const onitCliExecutable = isWindows ? 'onit.cmd' : 'onit';
/**
 * Test starter method
 *
 * @param onitConfigFile onitconfig file
 * @param testTarget Test config
 * @param argv  cli params
 */
async function startTest(onitConfigFile, testTarget, argv) {
    try {
        const doNotRebuild = argv['no-rebuild'];
        if (doNotRebuild) {
            logger_1.logger.log('');
            logger_1.logger.warn('Be sure all your code is compiled!');
            logger_1.logger.log('');
        }
        const runningPath = process.cwd();
        // get the mocha instance from the target workspace
        const Mocha = (0, requireMochaFromProcessCwd_1.requireMochaFromProcessCwd)();
        if (!Mocha) {
            throw new Error('Cannot find a local instance of mocha. Please add the dependency @mitech/onit-dev-tools.');
        }
        // do not recompile
        if (!doNotRebuild) {
            logger_1.logger.info('Cleaning project build...');
            await (0, spawn_1.spawn)(npm_1.npmExecutable, ['run', 'clean'], true);
            logger_1.logger.info('Building project...');
            await (0, spawn_1.spawn)(onitCliExecutable, ['serve', '-t', '-exit'], true);
        }
        let testEnvironment = {
            env: testTarget.environment
        };
        const requires = (0, checkFiles_1.checkFiles)(testTarget, runningPath);
        // file existance checked. Run them
        // startup must run before anything else.
        if (requires.startup) {
            logger_1.logger.log('Launch startup script...');
            try {
                testEnvironment = (await requires.startup.startup(testEnvironment)) || testEnvironment;
            }
            catch (e) {
                logger_1.logger.error('Startup script failed.');
                throw e;
            }
        }
        // IV 22-09-2022: mosso DOPO startup script perchè cosi lo stesso può
        // modificare l'environment se necessario
        // create the proces.env object to be set in order to pass values to onit
        testTarget.environment = testEnvironment.env;
        process.env = (0, spawnNodeProcess_1.buildEnvironment)(onitConfigFile, testTarget, argv);
        let onitInstance = null;
        // start onit.
        if (testTarget.launchOnit !== false) {
            logger_1.logger.log('Launching onit...');
            try {
                onitInstance = await (0, onitProcessLauncher_1.onitProcessLauncher)(onitConfigFile, testTarget);
            }
            catch (e) {
                logger_1.logger.error('Launch of onit process failed.');
                throw e;
            }
            testEnvironment.onit = onitInstance.onit;
        }
        // beforeTest must run after onit launch.
        if (requires.beforeTest) {
            logger_1.logger.log('Launch beforeTest script ...');
            try {
                testEnvironment = await requires.beforeTest.beforeTest(testEnvironment);
            }
            catch (e) {
                logger_1.logger.error('beforeTest script failed.');
                throw e;
            }
        }
        // set the testEnvironemtn as global so from now on it can be accessible
        // @ts-expect-error forcing setting this in glbal
        global.testEnvironment = testEnvironment;
        // run now mocha and wait for result
        const testCaseFiles = await (0, resolveTestFilesDirectories_1.resolveTestFilesDirectories)(testTarget);
        const mochaResult = await (0, runMocha_1.runMocha)(testTarget, Mocha, testCaseFiles);
        if (onitInstance) {
            // stop the onit process
            logger_1.logger.log('Stopping onit...');
            await onitInstance.stop();
        }
        // tests are finished. Run the shutdown script if any
        if (requires.shutdown) {
            logger_1.logger.log('Launch shutdown script...');
            try {
                await requires.shutdown.shutdown(testEnvironment, mochaResult);
            }
            catch (e) {
                logger_1.logger.error('shutdown script failed.');
                throw e;
            }
        }
        if (mochaResult.exitCode !== 0) {
            throw new Error('Mocha report some tests are failed');
        }
    }
    catch (e) {
        logger_1.logger.error('Test failed!');
        throw e;
    }
    logger_1.logger.info('Test success!');
}
exports.startTest = startTest;
//# sourceMappingURL=test.js.map