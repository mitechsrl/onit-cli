const logger = require('../../../../lib/logger');

/**
 * Run mocha with the passed-in test files
 * See https://mochajs.org/api/ for programmatical API's
 * @param {*} Mocha
 * @param {*} files
 * @returns
 */
function runMocha (testTarget, Mocha, files) {
    return new Promise(resolve => {
        const mocha = new Mocha();

        // add the test cases files
        files.forEach(file => mocha.addFile(file));

        // apply name filtering if any
        /* if (testTarget.grep) {
            logger.log('Mocha: setting grep ' + testTarget.grep.toString());
            mocha.grep(testTarget.grep);
        }

        if (testTarget.timeout) {
            logger.log('Mocha: setting timeout ' + testTarget.timeout.toString());
            mocha.timeout(testTarget.timeout);
        } */

        Object.getOwnPropertyNames(Mocha.prototype).forEach(propName => {
            // skip these propertis
            if (['constructor'].includes(propName)) return;
            if (propName.startsWith('_')) return;

            // set in mocha if also set in testTarget
            if (testTarget[propName]) {
                logger.log(`Mocha: set ${propName}=${testTarget[propName].toString()}`);
                mocha[propName](testTarget[propName]);
            }
        });

        // Run mocha. This will perform all the tests
        mocha.run(failures => {
            // resolve on end. Return a non-zero status if there were failures
            resolve({
                failures: failures,
                exitCode: failures ? 1 : 0
            });
        });
    });
}
module.exports.runMocha = runMocha;
