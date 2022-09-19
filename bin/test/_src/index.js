const logger = require('../../../lib/logger');
const { runMocha } = require('./lib/runMocha');
const { resolveTestFilesDirectories } = require('./lib/resolveTestFilesDirectories');
const { checkFiles } = require('./lib/checkFiles');
const { requireMochaFromProcessCwd } = require('./lib/requireMochaFromProcessCwd');
const { buildEnvironment, getMainExecutableFilePath } = require('../../../shared/2.0.0/lib/spawnNodeProcess.js');
const path = require('path');

/**
 *
 * @param {*} onitConfigFile
 * @param {*} testTarget
 */
async function onitProcessLauncher (onitConfigFile, testTarget) {
    process.env = buildEnvironment(onitConfigFile, testTarget);
    const mainFile = getMainExecutableFilePath(onitConfigFile, testTarget);

    const onit = require(path.join(process.cwd(), mainFile));
    const onitInstance = await onit.launch();

    // wait just some seconds to allow all async stuff to be initialized
    await new Promise(resolve => setTimeout(resolve, 4000));

    return {
        onit: onitInstance,
        stop: () => {
            return new Promise(resolve => {
                onitInstance.lbApp.onStop(() => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
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
module.exports.start = async (onitConfigFile, testTarget, basepath, params) => {
    logger.log('');
    logger.warn('Be sure all your code is compiled!');
    logger.log('');
    const runningPath = process.cwd();
    const requires = checkFiles(testTarget, runningPath);
    let testEnvironment = {};

    // get the mocha instance from the target workspace
    const Mocha = requireMochaFromProcessCwd();
    if (!Mocha) {
        throw new Error('Cannot find a local instance of mocha. Please add the dependency @mitech/onit-dev-tools.');
    }

    const testCaseFiles = await resolveTestFilesDirectories(testTarget);

    // file existance checked. Run them
    // startup must run before anything else.
    if (requires.startup) {
        logger.log('Launch startup script...');
        testEnvironment = (await requires.startup.startup()) || testEnvironment;
    }

    let onitInstance = null;
    // start onit.
    if (testTarget.launchOnit !== false) {
        logger.log('Launching onit...');
        onitInstance = await onitProcessLauncher(onitConfigFile, testTarget);
        testEnvironment.onit = onitInstance.onit;
    }

    // beforeTest must run after onit launch.
    if (requires.beforeTest) {
        logger.log('Launch beforeTest script ...');
        testEnvironment = await requires.beforeTest.beforeTest(testEnvironment);
    }

    // set the testEnvironemtn as global so from now on it can be accessible
    global.testEnvironment = testEnvironment;

    // run now mocha and wait for result
    const mochaResult = await runMocha(testTarget, Mocha, testCaseFiles);

    if (onitInstance) {
    // stop the onit process
        logger.log('Stopping onit...');
        await onitInstance.stop();
    }

    // tests are finished. Run the shutdown script if any
    if (requires.shutdown) {
        logger.log('Launch shutdown script...');
        await requires.shutdown.shutdown(testEnvironment, mochaResult);
    }

    if (mochaResult.exitCode !== 0) {
        logger.error('Test failed!');
    } else {
        logger.info('Test success!');
    }
};
