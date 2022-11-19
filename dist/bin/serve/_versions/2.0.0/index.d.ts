import yargs from 'yargs';
import { OnitConfigFile } from '../../../../types';
export declare function start(onitConfigFile: OnitConfigFile, version: string, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>;
