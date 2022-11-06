import { readFileSync, writeFileSync } from 'fs';
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

export async function replaceValues(cwd:string, answers:GenericObject) {
    const originalCwd = process.cwd();
    process.chdir(cwd);
    const replacements = [ // find & replace in files di src
        // { find: '@mitech/onit-next-example-webcomponent', replace: answers.appName },
        { find: 'OnitExampleWebComponent', replace: answers.componentClassName }, // nome class ecomponente
        { find: 'ONIT_EXAMPLE_WEB_COMPONENT', replace: answers.componentNameExport }, // nome componente
        { find: 'exampleWebComponent', replace: answers.componentClassNameShortCamelCase },
        { find: 'ExampleWebComponent', replace: upperFirst(answers.componentClassNameShortCamelCase) },
        { find: 'Onit example web component', replace: answers.appExtendedName },
        { find: 'onit-next-example-webcomponent', replace: answers.appNameWithoutScope }
    ];

    const files = [
        // join(process.cwd(), 'package.json'),
        join(process.cwd(), 'README.md'),
        ...await getFiles(join(process.cwd(), './src'))
    ];

    files.forEach(file => {
        let content = readFileSync(file).toString();
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
