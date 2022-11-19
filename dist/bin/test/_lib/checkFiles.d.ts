import { OnitConfigFileTestTarget } from '../../../types';
/**
 * check for startup/beforetest/shutdown files existence
 * @param {*} testTarget
 * @param {*} testPath
 * @returns Object, the required files
 */
export declare function checkFiles(testTarget: OnitConfigFileTestTarget, testPath: string): {
    startup: any;
    beforeTest: any;
    shutdown: any;
};
