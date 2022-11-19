"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixOnitConfig = void 0;
const path_1 = require("path");
const replaceInFile_1 = require("./replaceInFile");
async function fixOnitConfig(cwd, answers) {
    // replace database name in onit.config.js
    await (0, replaceInFile_1.replaceInFile)((0, path_1.join)(cwd, './onit.config.js'), /^(.*database: +['"]{1,1})[a-zA-Z0-9-_]+(['"]{1,1}.*)/mg, `$1${answers.databaseName}$2`);
}
exports.fixOnitConfig = fixOnitConfig;
//# sourceMappingURL=fixOnitConfig.js.map