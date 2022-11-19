import { GenericObject } from '../../../../types';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function fixPackageJson(cwd:string, answers:GenericObject) {
    const filename = join(cwd, 'package.json');
    const content = JSON.parse(readFileSync(filename).toString());
    content.name = answers.appName;
    content.description = answers.appDescription;
    content.version = '0.0.1';
    writeFileSync(filename, JSON.stringify(content, null, 4));
}
