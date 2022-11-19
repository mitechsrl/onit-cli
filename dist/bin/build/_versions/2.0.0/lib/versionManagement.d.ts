import { GenericObject, OnitConfigFileBuildTarget } from '../../../../../types';
/**
 * Display the version election
 *
 * @param buildTarget
 * @param vars
 * @param cwdPackageJson
 * @returns
 */
export declare function promptVersion(buildTarget: OnitConfigFileBuildTarget, vars: GenericObject, cwdPackageJson: GenericObject): Promise<any>;
/**
 * Update the package.json version before starting the build
 * @param cwdPackageJson
 * @param cwdPackageJsonFileName
 * @param version
 */
export declare function updateVersion(cwdPackageJson: GenericObject, cwdPackageJsonFileName: string, version: string): void;
