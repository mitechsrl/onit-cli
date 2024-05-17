import inquirer from 'inquirer';
import { logger } from '../../../lib/logger';
import { OnitConfigFile, OnitConfigFileTestTarget, StringError } from '../../../types';

/**
 * Show prompt to ask the user for test set.
 * If test set is only one, it will be autoselected
 *
 * @param {*} onitConfigFile
 * @returns
 */
export async function selectTest(onitConfigFile: OnitConfigFile, suiteName?:string): Promise<OnitConfigFileTestTarget>{
    // check for buildTargets existence
    const tests = onitConfigFile.json.test || {};
    if (Object.keys(tests).length === 0) {
        throw new StringError('No test defined. You should have the test property in your onit configuration file: ' + onitConfigFile.sources.join(', '));
    }

    // Manual suite selection
    if (suiteName) {
        if (tests[suiteName]) {
            return tests[suiteName];
        }
        throw new StringError('Test suite name not found: ' + suiteName);
    }

    // select build target. If only one buildTarget is available, use that one, show a selection prompt otherwise
    let testTarget: OnitConfigFileTestTarget = {};
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
