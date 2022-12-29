import yargs from 'yargs';
import { GenericObject, OnitConfigFile } from '../../../../../types';
export declare function nextJsBuild(onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject, buildMode: string, //'prduction'|'development',
argv?: yargs.ArgumentsCamelCase<unknown>): Promise<unknown>;
