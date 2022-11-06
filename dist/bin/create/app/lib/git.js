"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitRepo = exports.unlinkGitRepo = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const spawn_1 = require("../../../../lib/spawn");
/**
 * Removes the original git repo and init a new one
 * @param {*} cwd
 * @param {*} answers
 */
async function unlinkGitRepo(cwd, answers) {
    (0, fs_1.rmSync)((0, path_1.join)(cwd, './.git'), { recursive: true });
    const originalCwd = process.cwd();
    process.chdir(cwd);
    await (0, spawn_1.spawn)('git', ['init']);
    process.chdir(originalCwd);
}
exports.unlinkGitRepo = unlinkGitRepo;
async function commitRepo(cwd, answers) {
    const originalCwd = process.cwd();
    process.chdir(cwd);
    await (0, spawn_1.spawn)('git', ['add', '.']);
    await (0, spawn_1.spawn)('git', ['commit', '-m', '"Component init"']);
    process.chdir(originalCwd);
}
exports.commitRepo = commitRepo;
;
//# sourceMappingURL=git.js.map