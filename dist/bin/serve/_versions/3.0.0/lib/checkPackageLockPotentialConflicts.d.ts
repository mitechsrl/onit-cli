import { OnitConfigFile } from '../../../../../types';
/**
 * Prints potential conflicts by checking if "@mitech/..."" packages are installed in different versions
 * in the package-lock.json
 *
 * @param onitConfigFile
 */
export declare function assertPackageLockPotentialConflicts(onitConfigFile: OnitConfigFile): Promise<void>;
