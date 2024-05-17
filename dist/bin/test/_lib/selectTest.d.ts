import { OnitConfigFile, OnitConfigFileTestTarget } from '../../../types';
/**
 * Show prompt to ask the user for test set.
 * If test set is only one, it will be autoselected
 *
 * @param {*} onitConfigFile
 * @returns
 */
export declare function selectTest(onitConfigFile: OnitConfigFile, suiteName?: string): Promise<OnitConfigFileTestTarget>;
