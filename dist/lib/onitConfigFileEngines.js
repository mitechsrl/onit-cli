"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigFileBackendEngine = exports.getConfigFileFrontendEngine = void 0;
const types_1 = require("../types");
/**
 * Throws if the passed in item is not a pure valid object
 * @param _obj
 */
function checkObject(_obj) {
    if (!_obj || Array.isArray(_obj) || typeof _obj !== 'object') {
        throw new types_1.StringError('Unsupported engines value. Please set a object according to docs.');
    }
}
/**
 * Get the frontend engine config.
 * AS default, returns  { 'onit-webpack':true };
 * @param onitConfigFile
 * @returns
 */
function getConfigFileFrontendEngine(onitConfigFile) {
    const engines = onitConfigFile.json.engines;
    if (engines)
        checkObject(engines);
    // Fallback case: false will make the cli to skip frontend compilation
    if ((engines === null || engines === void 0 ? void 0 : engines.frontend) === false)
        return {};
    const _obj = (engines === null || engines === void 0 ? void 0 : engines.frontend) ? engines.frontend : { 'onit-webpack': true };
    checkObject(_obj);
    return _obj;
}
exports.getConfigFileFrontendEngine = getConfigFileFrontendEngine;
/**
 * Get the backend engine config.
 * AS default, returns  { 'lb4':true };
 * @param onitConfigFile
 * @returns
 */
function getConfigFileBackendEngine(onitConfigFile) {
    const engines = onitConfigFile.json.engines;
    if (engines)
        checkObject(engines);
    const _obj = (engines === null || engines === void 0 ? void 0 : engines.backend) ? engines.backend : { 'lb4': true };
    checkObject(_obj);
    return _obj;
}
exports.getConfigFileBackendEngine = getConfigFileBackendEngine;
//# sourceMappingURL=onitConfigFileEngines.js.map