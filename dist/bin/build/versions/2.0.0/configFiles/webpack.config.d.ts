import { Configuration } from 'webpack';
import { GenericObject } from '../../../../../types';
/**
 *
 * @param {*} context the webpack context path
 * @param {*} config
 * @param {*} packageJson the package.json content (js object) of the project to be webpacke'd.
 */
export declare function webpackConfigFactory(context: string, config: GenericObject, packageJson: GenericObject): Promise<Configuration>;
