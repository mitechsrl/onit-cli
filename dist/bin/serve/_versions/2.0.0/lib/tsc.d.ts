import yargs from 'yargs';
import { GenericObject, OnitConfigFile } from '../../../../../types';
export declare function tscWatchAndRun(onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>;
