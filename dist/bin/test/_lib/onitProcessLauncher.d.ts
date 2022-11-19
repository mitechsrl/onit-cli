import { OnitConfigFile, OnitConfigFileTestTarget } from '../../../types';
/**
 *
 * @param {*} onitConfigFile
 * @param {*} testTarget
 */
export declare function onitProcessLauncher(onitConfigFile: OnitConfigFile, testTarget: OnitConfigFileTestTarget): Promise<{
    onit: any;
    stop: () => Promise<unknown>;
}>;
