import { GenericObject, OnitConfigFile, OnitConfigFileBuildTarget } from '../../../../../types';
/**
 * Main build runner method. This entry point call all the others needed method
 *
 * NOTE: V3 build is the same as V2 build for "onit-webpack"+"lb4" engine, it just add the support to "nextjs" engine(on frontend)
 *
 * @param cwdPackageJson Package.json at rocess.cwd path
 * @param buildTarget Build target config
 * @param onitConfigFile The config file content
 *
 */
export declare function runBuild(cwdPackageJson: GenericObject, buildTarget: OnitConfigFileBuildTarget, onitConfigFile: OnitConfigFile): Promise<void>;
