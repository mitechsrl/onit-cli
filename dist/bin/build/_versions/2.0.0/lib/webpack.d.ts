import { GenericObject, OnitConfigFile } from '../../../../../types';
/**
 * Webpack builder runner
 *
 * @param distFeTargetDir
 * @param onitConfigFile The config file content
 * @param buildMode
 * @param injectBuildOptions
 * @returns
 */
export declare function runWebpack(distFeTargetDir: string, onitConfigFile: OnitConfigFile, buildMode: string, injectBuildOptions?: GenericObject): Promise<number>;
