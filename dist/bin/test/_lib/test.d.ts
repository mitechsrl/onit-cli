import { OnitConfigFile, OnitConfigFileTestTarget } from '../../../types';
import yargs from 'yargs';
/**
 * Test starter method
 *
 * @param onitConfigFile The config file content
 * @param testTarget Test config
 * @param argv yargs arguments
 */
export declare function startTest(onitConfigFile: OnitConfigFile, testTarget: OnitConfigFileTestTarget, argv: yargs.ArgumentsCamelCase<unknown>): Promise<number>;
