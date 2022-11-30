import { GenericObject } from '../../../types';
export declare type LabelFileInfo = {
    filename: string;
    content: GenericObject;
};
/**
 * Scan for label files in the specified directory
 *
 * @param dir search in this directory (recursively)
 * @returns
 */
export declare function scanLabelsFiles(dir: string): Promise<LabelFileInfo[]>;
