import { OnitConfigFile } from '../../../../../types';
/**
 * Merge function for webpack config. NOTE: this function will be called by lodash mergeWith.
 * The only extra stuff this fn does is to concat arrays, other stuff is managed automatically by _.merge.
 * @param {*} dst
 * @param {*} src
 */
export declare function webpackMergeFn(dst: any, src: any): any[] | undefined;
/**
 * Create teh webpack exports config by merging all the exports from our node_modules dependencies
 *
 * @param {*} context
 * @param {*} onitConfigFile
 * @returns
 */
export declare function buildWebpackConfig(context: string, onitConfigFile: OnitConfigFile): Promise<{}>;
