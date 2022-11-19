import { GenericObject } from '../../../../../types';
/**
 * Complete the webpack config by merging the internal-generated configuration with the user-provided one.
 * The file must be placed in project top level directory with name 'webpack.config.js'.
 * NOTE: the user.provided file must export a function as default in the form of
 *
 * (previousConfig, options) => newConfig
 *
 * @param obj previous config
 * @param fileName user webpack.config.js file to be merged
 * @returns
 */
export declare function mixinFromFile(obj: GenericObject, fileName: string): any;
