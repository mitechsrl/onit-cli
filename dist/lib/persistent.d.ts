import { GenericObject } from '../types';
declare let baseConfigDir: string;
export { baseConfigDir };
/**
 * Get the persistent file for a specified key
 *
 * @param key
 * @param filename
 * @returns
 */
export declare function getPersistent(key: string, filename?: string): GenericObject;
/**
 * Set the persisted value for a specified key
 *
 * @param key
 * @param obj
 * @param filename
 */
export declare function setPersistent(key: string, obj: GenericObject, filename?: string): void;
