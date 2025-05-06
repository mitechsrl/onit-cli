import { OnitConfigFile } from '../../../../types';
import yargs from 'yargs';
/**
 *
 * @param onitConfigFile The config file content
 * @param argv yargs arguments
 * @returns
 */
export default function build(onitConfigFile: OnitConfigFile, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>;
