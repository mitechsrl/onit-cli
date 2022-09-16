const { existsSync } = require('fs');
const path = require('path');

/**
 * check for startup/beforetest/shutdown files existence
 * @param {*} testTarget
 * @param {*} testPath
 * @returns Object, the required files
 */
function checkFiles (testTarget, testPath) {
    let startup = null;
    if (testTarget.startup) {
        const startupFilePath = path.join(testPath, testTarget.startup);
        if (!existsSync(startupFilePath)) {
            throw new Error('File ' + startupFilePath + ' not found');
        }
        startup = require(startupFilePath);
        if (typeof startup.startup !== 'function') {
            throw new Error('startup file must export a \'startup\' function');
        }
    }
    let beforeTest = null;
    if (testTarget.beforeTest) {
        const beforeTestFilePath = path.join(testPath, testTarget.beforeTest);
        if (!existsSync(beforeTestFilePath)) {
            throw new Error('File ' + beforeTestFilePath + ' not found');
        }
        beforeTest = require(beforeTestFilePath);
        if (typeof beforeTest.beforeTest !== 'function') {
            throw new Error('beforeTest file must export a \'beforeTest\' function');
        }
    }
    let shutdown = null;
    if (testTarget.shutdown) {
        const shutdownFilePath = path.join(testPath, testTarget.shutdown);
        if (!existsSync(shutdownFilePath)) {
            throw new Error('File ' + shutdownFilePath + ' not found');
        }
        shutdown = require(shutdownFilePath);
        if (typeof shutdown.shutdown !== 'function') {
            throw new Error('shutdown file must export a \'shutdown\' function');
        }
    }

    return {
        startup: startup,
        beforeTest: beforeTest,
        shutdown: shutdown
    };
}
module.exports.checkFiles = checkFiles;
