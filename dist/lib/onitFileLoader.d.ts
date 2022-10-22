import { OnitConfigFile } from '../types';
/**
 * Search for various config giles format. In detail
 * - search for (and use if found) onit.config.[js|json] (and optionally, if available onit.config.local.[js|json])
 * - if not found, search for legacy onitserve.config.[js|json] and onitbuild.config.[js|json] (and their local versions)
 *
 * NOTE: the local versions are files with the same structure of the non.local version, it's just designed to not be commited
 * so users can add their own parameters ( probably local paths to the user system or any other temporary config)
 *
 * Throws if nothing can be found
 * @param {*} context
 * @param {*} customFileName Filename to be loaded
 */
export declare function onitFileLoader(context?: string, configFileNameOverride?: string): Promise<OnitConfigFile>;
