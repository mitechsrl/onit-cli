import yargs from 'yargs';
import { GenericObject, OnitConfigFile } from '../../../../../types';
export declare function nextJsBuild(onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject, buildMode: string, //'production'|'development',
env?: GenericObject, // Values to add to env when spawning cli 
argv?: yargs.ArgumentsCamelCase<unknown>): Promise<unknown>;
