import { rmSync } from 'fs';
import { join } from 'path';
import { spawn } from '../../../../lib/spawn';
import { GenericObject } from '../../../../types';

/**
 * Removes the original git repo and init a new one
 * @param {*} cwd
 * @param {*} answers
 */
export async function unlinkGitRepo(cwd:string, answers:GenericObject) {
    rmSync(join(cwd, './.git'), { recursive: true });

    const originalCwd = process.cwd();
    process.chdir(cwd);
    await spawn('git', ['init']);
    process.chdir(originalCwd);
}

export async function commitRepo(cwd:string, answers:GenericObject) {
    const originalCwd = process.cwd();
    process.chdir(cwd);
    await spawn('git', ['add', '.']);
    await spawn('git', ['commit', '-m', '"Component init"']);
    process.chdir(originalCwd);
};
