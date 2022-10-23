import { OnitConfigFile } from '../../../../../types';
export declare function pm2stop(): Promise<import("../../../../../lib/spawn").SpawnResult>;
export declare function pm2start(onitConfigFile: OnitConfigFile): Promise<any>;
