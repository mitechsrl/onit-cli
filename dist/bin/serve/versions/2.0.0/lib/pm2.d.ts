import { OnitConfigFile } from '../../../../../types';
/**
 * Stop pm2 instances.
 * The process is detached so this cli can stop immediately without waiting for pm2 stop.
 */
export declare function pm2stop(): Promise<void>;
/**
 * Launch apps from pm2-dev-ecosystem config.
 *
 * @param onitConfigFile
 * @returns The number of app launched
 */
export declare function pm2start(onitConfigFile: OnitConfigFile): Promise<number>;
