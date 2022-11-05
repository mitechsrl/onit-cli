import { OnitConfigFile, OnitConfigFileTestTarget } from '../../../types';
import yargs from 'yargs';
/**
 * Test starter method
 *
 * @param onitConfigFile onitconfig file
 * @param testTarget Test config
 * @param argv  cli params
 */
export declare function startTest(onitConfigFile: OnitConfigFile, testTarget: OnitConfigFileTestTarget, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>;
