"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceValues = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
async function getFiles(dir) {
    const files = [];
    const dirents = await (0, promises_1.readdir)(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = (0, path_1.resolve)(dir, dirent.name);
        if (dirent.isDirectory()) {
            files.push(...await getFiles(res));
        }
        else {
            files.push(res);
        }
    }
    return files;
}
async function replaceValues(cwd, answers) {
    const originalCwd = process.cwd();
    process.chdir(cwd);
    const replacements = answers.repo.replacer(answers);
    const files = [
        // join(process.cwd(), 'package.json'),
        (0, path_1.join)(process.cwd(), 'README.md'),
        ...await getFiles((0, path_1.join)(process.cwd(), './src'))
    ];
    const nextJsConfig = (0, path_1.join)(process.cwd(), 'next.config.js');
    if ((0, fs_1.existsSync)(nextJsConfig))
        files.push(nextJsConfig);
    files.forEach(file => {
        let content = '';
        try {
            content = (0, fs_1.readFileSync)(file).toString();
        }
        catch (e) {
            console.warn(`[WARNING] File "${file}" not found. Skipping find-replace operations for this file...`);
            return;
        }
        const original = content;
        replacements.forEach(r => {
            content = content.replace(new RegExp(r.find, 'g'), r.replace);
        });
        if (content !== original) {
            (0, fs_1.writeFileSync)(file, content);
        }
    });
    process.chdir(originalCwd);
}
exports.replaceValues = replaceValues;
//# sourceMappingURL=replaceValues.js.map