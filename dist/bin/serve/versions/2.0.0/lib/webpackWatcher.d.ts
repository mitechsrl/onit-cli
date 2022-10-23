import yargs from 'yargs';
import { GenericObject } from '../../../../../types';
/**
 *
 * @param webpackConfig
 * @param argv
 * @returns
 */
export declare function webpackWatcher(webpackConfig: GenericObject, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>;
