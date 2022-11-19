import { GenericObject } from '../../../../types';
declare const RepositoryGenerator: any;
/**
 * Subclass loopback-cli model generator and apply custom logic
 */
export declare class CustomRepositoryGenerator extends RepositoryGenerator {
    constructor();
    presetValues(data: GenericObject): void;
    /**
     * override the default copy template since we are using a custom one.
     * @param {*} _source Source template path
     * @param {*} dest destination file path
     * @param {*} artifactInfo Source data object for current artifact
     */
    copyTemplatedFiles(_source: string, dest: string, artifactInfo: GenericObject): void;
    /**
     * Ovwerwirte the promptModelId method to skip the inquirer prompt if we passed the value as parameter
     */
    promptModelId(): Promise<void>;
    /**
     *
     */
    promptModels(): Promise<void>;
    /**
     * overwrite the scaffold methods to perform custom checks and ask for mixins before effectively scaffolding
     */
    _scaffold(): Promise<void>;
    promptMixinSelection(): Promise<void>;
}
export {};
