import { GenericObject, OnitConfigFile, OnitConfigFileBuildTarget } from '../../../../../types';
/**
 * Main build runner method. This entry point call all he others needed mthod
 *
 * @param cwdPackageJson Package.json at rocess.cwd path
 * @param buildTarget Build target config
 * @param onitConfigFile Full onit config file
 *
 */
export declare function runBuild(cwdPackageJson: GenericObject, buildTarget: OnitConfigFileBuildTarget, onitConfigFile: OnitConfigFile): Promise<{}>;
