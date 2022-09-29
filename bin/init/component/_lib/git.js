const { rmSync } = require('fs');
const { join } = require('path');
const spawn = require('../../../../lib/spawn');

/**
 * Removes the original git repo and init a new one
 * @param {*} cwd
 * @param {*} answers
 */
module.exports.unlinkGitRepo = async function (cwd, answers) {
    rmSync(join(cwd, './.git'), { recursive: true });

    const originalCwd = process.cwd();
    process.chdir(cwd);
    await spawn('git', ['init']);
    process.chdir(originalCwd);
};

module.exports.commitRepo = async function (cwd, answers) {
    const originalCwd = process.cwd();
    process.chdir(cwd);
    await spawn('git', ['add', '.']);
    await spawn('git', ['commit', '-m', '"Component init"']);
    process.chdir(originalCwd);
};
