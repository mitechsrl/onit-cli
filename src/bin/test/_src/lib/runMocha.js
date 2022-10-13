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

        // get the mocha properties from config and set them
        Object.getOwnPropertyNames(Mocha.prototype).forEach(propName => {
            // skip these properties
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
