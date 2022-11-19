import { GenericObject } from '../../../../types';
declare const ServiceGenerator: any;
/**
 * Subclass loopback-cli model generator and apply custom logic
 */
export declare class CustomServiceGenerator extends ServiceGenerator {
    constructor();
    copyTemplatedFiles(_unused: unknown, filename: string, data: GenericObject): void;
    scaffold(): Promise<void>;
}
export {};
