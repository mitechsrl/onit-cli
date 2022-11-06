"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceValues = void 0;
const fs_1 = require("fs");
const lodash_1 = require("lodash");
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
    const replacements = [
        // { find: '@mitech/onit-next-example-webcomponent', replace: answers.appName },
        { find: 'OnitExampleWebComponent', replace: answers.componentClassName },
        { find: 'ONIT_EXAMPLE_WEB_COMPONENT', replace: answers.componentNameExport },
        { find: 'exampleWebComponent', replace: answers.componentClassNameShortCamelCase },
        { find: 'ExampleWebComponent', replace: (0, lodash_1.upperFirst)(answers.componentClassNameShortCamelCase) },
        { find: 'Onit example web component', replace: answers.appExtendedName },
        { find: 'onit-next-example-webcomponent', replace: answers.appNameWithoutScope }
    ];
    const files = [
        // join(process.cwd(), 'package.json'),
        (0, path_1.join)(process.cwd(), 'README.md'),
        ...await getFiles((0, path_1.join)(process.cwd(), './src'))
    ];
    files.forEach(file => {
        let content = (0, fs_1.readFileSync)(file).toString();
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