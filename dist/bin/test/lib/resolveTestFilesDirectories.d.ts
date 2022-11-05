import { OnitConfigFileTestTarget } from '../../../types';
/**
 * Scan directories for test cases files. Directory match can be inglob syntax
 *
 * @param {*} testTarget
 * @return A promise which resolves with the files list
 */
export declare function resolveTestFilesDirectories(testTarget: OnitConfigFileTestTarget): Promise<string[]>;
