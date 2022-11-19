import { OnitDocumentationConfigFileJson } from '../../../types';
/**
 * Find all files with glob.
 *
 * @param {*} config
 * @param {*} cwd
 * @returns Array of {file: string, parser:string} objects.
 * parser is the name of theparser expected to be used to process the file
 * file is the absolute path of the file to be prrocessed
 */
export declare function findFiles(config: OnitDocumentationConfigFileJson, cwd?: string): Promise<{
    file: string;
    parser: string;
}[]>;
