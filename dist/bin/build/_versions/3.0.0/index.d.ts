import { OnitConfigFile } from '../../../../types';
import yargs from 'yargs';
/**
 *
 * @param onitConfigFile
 * @param argv
 * @returns
 */
export default function build(onitConfigFile: OnitConfigFile, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>;
