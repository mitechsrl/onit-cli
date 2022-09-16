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

const onitFileLoader = require('../../lib/onitFileLoader');
const fs = require('fs');
const path = require('path');
const logger = require('../../lib/logger');
const inquirer = require('inquirer');

module.exports.info = 'Test utility';
module.exports.help = [
    ['-c', 'Onit config file']
];

async function selectTest (onitConfigFile) {
    // check for buildTargets existence
    const tests = onitConfigFile.json.test || {};
    if (Object.keys(tests).length === 0) {
        logger.error('No test defined. You should have the test property in your onit configuration file: ' + onitConfigFile.sources.join(', '));
        return;
    }

    // select build target. If only one buildTarget is available, use that one, show a selection prompt otherwise
    let testTarget = null;
    if (Object.keys(tests).length === 1) {
        const key = Object.keys(tests)[0];
        testTarget = tests[key];
        testTarget.key = key;
    } else {
        const list = [{
            type: 'list',
            name: 'testTarget',
            message: 'Select test target',
            choices: Object.keys(tests)
        }];
        const answers = await inquirer.prompt(list);
        testTarget = tests[answers.testTarget];
        if (!testTarget) {
            throw new Error('Error selecting test target!');
        }
        testTarget.key = answers.testTarget;
    }

    logger.info('Selected test target: ' + testTarget.key);
    return testTarget;
}

module.exports.cmd = async function (basepath, params) {
    try {
        // check for manual serve file specifed
        const manualConfigFile = params.get('-c');

        // load the buildFile
        const onitConfigFile = await onitFileLoader.load(process.cwd(), manualConfigFile.found ? manualConfigFile.value : null);
        logger.warn('Uso file(s) config ' + onitConfigFile.sources.join(', '));

        if (!onitConfigFile.json.test) {
            throw new Error('Il test non è disponibile. Verifica di avere la proprietà <test> nel file di configurazioen di onit.');
        }
        const testTarget = await selectTest(onitConfigFile);
        const test = require('./_src/index');
        await test.start(onitConfigFile, testTarget, basepath, params);
    } catch (e) {
        logger.error('Serve interrotto');
        throw e;
    }
};
