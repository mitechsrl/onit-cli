import yargs from 'yargs';
import { GenericObject, OnitConfigFile } from '../../../../../types';
/**
 * Launch a webpack build & watch. Resolve when the user trigger SIGINT (since this is a cli,
 * the user acan stop it by pressing ctrl+c)
 *
 * @param onitConfigFile
 * @param cwdPackageJson
 * @param argv
 * @returns
 */
export declare function webpackDevBuildAndWatch(onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>;
