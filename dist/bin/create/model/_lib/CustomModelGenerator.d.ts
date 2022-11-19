import { GenericObject } from '../../../../types';
declare const ModelGenerator: any;
/**
 * Subclass loopback-cli model generator and apply custom logic
 */
export declare class CustomModelGenerator extends ModelGenerator {
    constructor();
    copyTemplatedFiles(_unused: unknown, filename: string, artifactInfo: GenericObject): void;
    scaffold(): Promise<void>;
    promptMixinSelection(): Promise<void>;
}
export {};
