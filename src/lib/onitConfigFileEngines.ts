import { GenericObject, OnitConfigFile, OnitConfigFileEngineBackend, OnitConfigFileEngineFrontend, StringError } from '../types';

/**
 * Throws if the passed in item is not a pure valid object
 * @param _obj 
 */
function checkObject(_obj: GenericObject){
    if (!_obj || Array.isArray(_obj) || typeof _obj !== 'object'){
        throw new StringError('Unsupported engines value. Please set a object according to docs.');
    }
}

/**
 * Get the frontend engine config. 
 * AS default, returns  { 'onit-webpack':true };
 * @param onitConfigFile 
 * @returns 
 */
export function getConfigFileFrontendEngine(onitConfigFile: OnitConfigFile): OnitConfigFileEngineFrontend {
    const engines = onitConfigFile.json.engines;
    if (engines) checkObject(engines);
    const _obj = (engines?.frontend) ? engines.frontend : { 'onit-webpack':true };
    checkObject(_obj);
    return _obj;
}

/**
 * Get the backend engine config. 
 * AS default, returns  { 'lb4':true };
 * @param onitConfigFile 
 * @returns 
 */
export function getConfigFileBackendEngine(onitConfigFile: OnitConfigFile): OnitConfigFileEngineBackend{
    const engines = onitConfigFile.json.engines;
    if (engines) checkObject(engines);
    const _obj = (engines?.backend) ? engines.backend : { 'lb4':true };
    checkObject(_obj);
    return _obj;
}