import { GenericObject, OnitConfigFile } from '../../../../../types';
/**
 * Clean the build directory
 *
 * @param onitConfigFile The config file content
 * @param cwdPackageJson
 * @returns
 */
export declare function runClean(onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject): Promise<number>;
