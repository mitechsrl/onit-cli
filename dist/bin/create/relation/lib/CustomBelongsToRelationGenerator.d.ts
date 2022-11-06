import { GenericObject } from '../../../../types';
declare const BelongsToRelationGenerator: any;
/**
 * Redefinition of BelongsToRelationGenerator for our internal needs
 */
export declare class CustomBelongsToRelationGenerator extends BelongsToRelationGenerator {
    _initializeProperties(options: GenericObject): void;
    /**
     * custom template path
     * @param {*} templateFile
     * @returns
     */
    templatePath(templateFile: string): string;
    /**
     * override the default copy template to add our custom render
     * @param {*} sourceFile
     * @param {*} dstFile
     * @param {*} data
     */
    copyTemplatedFiles(sourceFile: string, dstFile: string, data: GenericObject): void;
    /**
     * Override generateRepositories to address our internal class name
     * @param {*} options
     */
    generateRepositories(options: GenericObject): Promise<void>;
}
export {};
