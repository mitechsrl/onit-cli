import { OnitConfigFileTestTarget } from '../../../types';
export type RunMochaResult = {
    failures: number;
    exitCode: number;
};
/**
 * Run mocha with the passed-in test files
 * See https://mochajs.org/api/ for programmatical API's
 *
 *@param testTarget
 * @param Mocha
 * @param files
 * @returns
 */
export declare function runMocha(testTarget: OnitConfigFileTestTarget, Mocha: any, files: string[]): Promise<RunMochaResult>;
