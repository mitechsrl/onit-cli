import { GenericObject } from '../../../../types';
declare const HasManyThroughRelationGenerator: any;
export declare class CustomHasManyThroughRelationGenerator extends HasManyThroughRelationGenerator {
    /**
     * Our repos have a 'Base' class which is the one to be changed.
     * Temporary set the correct name
     * @param {*} options
     */
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
