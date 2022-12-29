"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigFileBackendEngine = exports.getConfigFileFrontendEngine = void 0;
function getConfigFileFrontendEngine(onitConfigFile) {
    const engines = onitConfigFile.json.engines;
    const _tmp = (engines === null || engines === void 0 ? void 0 : engines.frontend) ? engines.frontend : ['onit-webpack'];
    // this removes duplicates
    return [...new Set(_tmp)];
}
exports.getConfigFileFrontendEngine = getConfigFileFrontendEngine;
function getConfigFileBackendEngine(onitConfigFile) {
    const engines = onitConfigFile.json.engines;
    const _tmp = (engines === null || engines === void 0 ? void 0 : engines.backend) ? engines.backend : ['lb4'];
    // this removes duplicates
    return [...new Set(_tmp)];
}
exports.getConfigFileBackendEngine = getConfigFileBackendEngine;
//# sourceMappingURL=onitConfigFileEngines.js.map