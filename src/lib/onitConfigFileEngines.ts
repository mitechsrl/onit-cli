import { OnitConfigFile, OnitConfigFileEngineBackend, OnitConfigFileEngineFrontend } from '../types';

export function getConfigFileFrontendEngine(onitConfigFile: OnitConfigFile): OnitConfigFileEngineFrontend[]{
    const engines = onitConfigFile.json.engines;
    const _tmp= (engines?.frontend) ? engines.frontend : ['onit-webpack'];

    // this removes duplicates
    return [...new Set(_tmp)] as OnitConfigFileEngineFrontend[];
}
export function getConfigFileBackendEngine(onitConfigFile: OnitConfigFile): OnitConfigFileEngineBackend[]{
    const engines = onitConfigFile.json.engines;
    const _tmp = (engines?.backend) ? engines.backend : ['lb4'];

    // this removes duplicates
    return [...new Set(_tmp)] as OnitConfigFileEngineBackend[];
}