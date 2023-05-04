import { existsSync, readFileSync, writeFileSync } from 'fs';
import { upperFirst } from 'lodash';
import { readdir } from 'fs/promises';
import { resolve, join } from 'path';
import { GenericObject } from '../../../../types';

async function getFiles(dir:string) {
    const files: string[] = [];
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            files.push(...await getFiles(res));
        } else {
            files.push(res);
        }
    }
    return files;
}

export async function replaceValues(cwd: string, answers: GenericObject) {
    const originalCwd = process.cwd();
    process.chdir(cwd);
    const replacements: GenericObject[] = answers.repo.replacer(answers);

    const files = [
        // join(process.cwd(), 'package.json'),
        join(process.cwd(), 'README.md'),
        ...await getFiles(join(process.cwd(), './src'))
    ];

    const nextJsConfig = join(process.cwd(), 'next.config.js');
    if (existsSync(nextJsConfig)) files.push(nextJsConfig);

    files.forEach(file => {
        let content = '';
        try {
            content = readFileSync(file).toString();
        } catch(e) {
            console.warn(`[WARNING] File "${file}" not found. Skipping find-replace operations for this file...`);
            return;
        }
        
        const original = content;
        replacements.forEach(r => {
            content = content.replace(new RegExp(r.find, 'g'), r.replace);
        });
        if (content !== original) {
            writeFileSync(file, content);
        }
    });

    process.chdir(originalCwd);
}
