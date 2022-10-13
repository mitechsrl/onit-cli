const { readFileSync, writeFileSync } = require('fs');
const { snakeCase, camelCase, capitalize } = require('lodash');
const { readdir } = require('fs').promises;
const { resolve, join } = require('path');

async function getFiles (dir) {
    const files = [];
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

module.exports.replaceValues = async function (cwd, answers) {
    const originalCwd = process.cwd();
    process.chdir(cwd);
    const replacements = [ // find & replace in files di src
        // { find: '@mitech/onit-next-example-webcomponent', replace: answers.appName },
        { find: 'ExampleWebComponent', replace: capitalize(camelCase(answers.componentClassName)) }, // nome class ecomponente
        { find: 'EXAMPLE_WEB_COMPONENT', replace: snakeCase(answers.componentClassName).toUpperCase() }, // nome componente
        { find: 'exampleWebComponent', replace: camelCase(answers.componentClassName) },
        { find: 'Onit example web component', replace: answers.appExtendedName },
        { find: 'onit-next-example-webcomponent', replace: answers.appNameWithoutScope }
    ];

    const files = [
        // join(process.cwd(), 'package.json'),
        join(process.cwd(), 'README.md'),
        ...await getFiles('./src')
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
};
