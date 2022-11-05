"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectTest = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("../../../lib/logger");
const types_1 = require("../../../types");
/**
 * Show prompt to ask the user for test set.
 * If test set is only one, it will be autoselected
 *
 * @param {*} onitConfigFile
 * @returns
 */
async function selectTest(onitConfigFile) {
    // check for buildTargets existence
    const tests = onitConfigFile.json.test || {};
    if (Object.keys(tests).length === 0) {
        throw new types_1.StringError('No test defined. You should have the test property in your onit configuration file: ' + onitConfigFile.sources.join(', '));
    }
    // select build target. If only one buildTarget is available, use that one, show a selection prompt otherwise
    let testTarget = {};
    if (Object.keys(tests).length === 1) {
        const key = Object.keys(tests)[0];
        testTarget = tests[key];
        testTarget.key = key;
    }
    else {
        const list = [{
                type: 'list',
                name: 'testTarget',
                message: 'Select test target',
                choices: Object.keys(tests)
            }];
        const answers = await inquirer_1.default.prompt(list);
        testTarget = tests[answers.testTarget];
        if (!testTarget) {
            throw new Error('Error selecting test target!');
        }
        testTarget.key = answers.testTarget;
    }
    logger_1.logger.info('Selected test target: ' + testTarget.key);
    return testTarget;
}
exports.selectTest = selectTest;
//# sourceMappingURL=selectTest.js.map