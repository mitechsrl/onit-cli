import { readFileSync, writeFileSync } from 'fs';

export async function replaceInFile(filename:string, match:RegExp, replace:string) {
    let content = readFileSync(filename).toString();
    content = content.replace(match, replace);
    writeFileSync(filename, content);
}
