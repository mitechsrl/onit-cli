import { SpawnOptions } from './spawn';
/**
 * Check for newer versions and show a info in the console
 * This is just for a reminder, doesn't do anything else.
 * Check is performed once a day
 */
export declare function npmVersionCheck(): Promise<void>;
/**
 * Proxy method to spawn npm process
 */
export declare function npm(params: string[], options?: SpawnOptions): Promise<import("./spawn").SpawnResult>;
/**
 * Proxy method to spawn npx process
 */
export declare function npx(params: string[], options?: SpawnOptions): Promise<import("./spawn").SpawnResult>;
