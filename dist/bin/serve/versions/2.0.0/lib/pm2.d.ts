import { OnitConfigFile } from '../../../../../types';
export declare function pm2stop(): Promise<void>;
/**
 * Launch apps from pm2-dev-ecosystem config.
 *
 * @param onitConfigFile
 * @returns The number of app launched
 */
export declare function pm2start(onitConfigFile: OnitConfigFile): Promise<number>;
