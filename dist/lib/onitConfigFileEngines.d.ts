import { OnitConfigFile, OnitConfigFileEngineBackend, OnitConfigFileEngineFrontend } from '../types';
/**
 * Get the frontend engine config.
 * AS default, returns  { 'onit-webpack':true };
 * @param onitConfigFile
 * @returns
 */
export declare function getConfigFileFrontendEngine(onitConfigFile: OnitConfigFile): OnitConfigFileEngineFrontend;
/**
 * Get the backend engine config.
 * AS default, returns  { 'lb4':true };
 * @param onitConfigFile
 * @returns
 */
export declare function getConfigFileBackendEngine(onitConfigFile: OnitConfigFile): OnitConfigFileEngineBackend;
