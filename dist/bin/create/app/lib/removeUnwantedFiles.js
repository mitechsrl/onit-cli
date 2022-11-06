"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUnwantedFiles = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
async function removeUnwantedFiles(cwd, answers) {
    // files to be deleted
    const deleteFiles = [
        './src/controllers/onit-demo',
        './src/client/routes/demo',
        './src/models/demo.model.ts',
        './src/repositories/demo.repository.ts'
    ];
    for (const file of deleteFiles) {
        const filename = (0, path_1.join)(cwd, file);
        const stat = (0, fs_1.statSync)(filename);
        if (stat.isDirectory()) {
            (0, fs_1.rmSync)(filename, { recursive: true });
        }
        else {
            (0, fs_1.unlinkSync)(filename);
        }
    }
    // files to be made empty
    const emptyFiles = [
        './src/controllers/index.ts',
        './src/models/index.ts',
        './src/repositories/index.ts'
    ];
    for (const file of emptyFiles) {
        const filename = (0, path_1.join)(cwd, file);
        (0, fs_1.writeFileSync)(filename, '');
    }
}
exports.removeUnwantedFiles = removeUnwantedFiles;
//# sourceMappingURL=removeUnwantedFiles.js.map