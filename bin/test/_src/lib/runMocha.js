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
        if (testTarget.matchNameTag) {
            mocha.grep(testTarget.matchNameTag);
        }

        // Run mocha. THis will perform all the tests
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
