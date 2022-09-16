/**
 * Run mocha with the passed-in test files
 *
 * @param {*} Mocha
 * @param {*} files
 * @returns
 */
function runMocha (testTarget, Mocha, files) {
    return new Promise(resolve => {
        const mocha = new Mocha();
        files.forEach(file => {
            mocha.addFile(file);
        });

        if (testTarget.matchNameTag) {
            mocha.grep(testTarget.matchNameTag);
        }

        mocha.run(failures => {
            resolve({
                failures: failures,
                exitCode: failures ? 1 : 0 // exit with non-zero status if there were failures
            });
        });
    });
}
module.exports.runMocha = runMocha;
