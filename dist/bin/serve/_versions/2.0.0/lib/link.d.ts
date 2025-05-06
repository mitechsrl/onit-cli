import { OnitConfigFile } from '../../../../../types';
/**
 * Process onitConfigFile.json.link and create local links. This method is a proxy to npm link.
 *
 * @param onitConfigFile The config file content
 * @returns
 */
export declare function processOnitConfigFileLinks(onitConfigFile: OnitConfigFile): Promise<null | undefined>;
