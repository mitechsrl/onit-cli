import { GenericObject } from '../../../../types';
declare const ControllerGenerator: any;
/**
 * Subclass loopback-cli generator and apply custom logic
 */
export declare class CustomControllerGenerator extends ControllerGenerator {
    /**
     * override the default copy template since we are using a custom one.
     * @param {*} _source the template file path. unused here, will be recalculated
     * @param {*} _dest The original destination file path. Unused here, will be recalculated.
     * @param {*} artifactInfo Source data object for current artifact
     */
    copyTemplatedFiles(_source: unknown, _dest: string, artifactInfo: GenericObject): void;
}
export {};
