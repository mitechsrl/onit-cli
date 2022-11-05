import { GenericObject, OnitConfigFile } from '../../../../../types';
/**
 * Clean the build directory
 *
 * @param onitConfigFile
 * @param cwdPackageJson
 * @returns
 */
export declare function runClean(onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject): Promise<number>;
