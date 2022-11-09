import { OnitDocumentationConfigFileJson } from '../../../types';
/**
 * Scan  and generate the doc files at the specified path
 *
 * @param config Documentation config file
 * @param scanTargetDir Dierectory to be scanned for comments
 * @param outDir The final markdown oututt directory
 *
 */
export declare function generateDoc(config: OnitDocumentationConfigFileJson, scanTargetDir: string, outDir: string): Promise<void>;
