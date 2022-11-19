"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixPackageJson = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
async function fixPackageJson(cwd, answers) {
    const filename = (0, path_1.join)(cwd, 'package.json');
    const content = JSON.parse((0, fs_1.readFileSync)(filename).toString());
    content.name = answers.appName;
    content.description = answers.appDescription;
    content.version = '0.0.1';
    (0, fs_1.writeFileSync)(filename, JSON.stringify(content, null, 4));
}
exports.fixPackageJson = fixPackageJson;
//# sourceMappingURL=fixPackageJson.js.map