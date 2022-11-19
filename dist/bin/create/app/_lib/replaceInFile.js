"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceInFile = void 0;
const fs_1 = require("fs");
async function replaceInFile(filename, match, replace) {
    let content = (0, fs_1.readFileSync)(filename).toString();
    content = content.replace(match, replace);
    (0, fs_1.writeFileSync)(filename, content);
}
exports.replaceInFile = replaceInFile;
//# sourceMappingURL=replaceInFile.js.map