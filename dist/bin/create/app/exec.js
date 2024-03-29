"use strict";
/*
Copyright (c) 2021 Mitech S.R.L.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const lodash_1 = require("lodash");
const path_1 = require("path");
const fs_1 = require("fs");
const logger_1 = require("../../../lib/logger");
const spawn_1 = require("../../../lib/spawn");
const git_1 = require("./_lib/git");
const replaceValues_1 = require("./_lib/replaceValues");
const fixPackageJson_1 = require("./_lib/fixPackageJson");
const removeUnwantedFiles_1 = require("./_lib/removeUnwantedFiles");
const fixOnitConfig_1 = require("./_lib/fixOnitConfig");
const replaceInFile_1 = require("./_lib/replaceInFile");
// const nameMatch = /^(@[a-zA-Z0-9-_]+\/){0,1}([a-zA-Z0-9-_]+)$/g;
const nameMatch = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?([a-z0-9-~][a-z0-9-._~]*)$/g;
function stringToComponentClassName(appName) {
    let componentClassName = (0, lodash_1.upperFirst)((0, lodash_1.camelCase)(appName.replace(nameMatch, '$1')));
    if (!componentClassName.match(/^([Oo]nit)(.*)$/)) {
        componentClassName = 'Onit' + (0, lodash_1.upperFirst)(componentClassName);
    }
    if (!componentClassName.match(/^(.*)([Cc]omponent)$/)) {
        componentClassName = componentClassName + 'Component';
    }
    return componentClassName;
}
const repoChoices = [
    {
        name: 'onit-next-example-webcomponent',
        value: {
            url: 'https://github.com/mitechsrl/onit-next-example-webcomponent.git',
            replacer: (answers) => {
                return [
                    { find: 'OnitExampleWebComponent', replace: answers.componentClassName },
                    { find: 'ONIT_EXAMPLE_WEB_COMPONENT', replace: answers.componentNameExport },
                    { find: 'exampleWebComponent', replace: answers.componentClassNameShortCamelCase },
                    { find: 'ExampleWebComponent', replace: (0, lodash_1.upperFirst)(answers.componentClassNameShortCamelCase) },
                    { find: 'Onit example web component', replace: answers.appExtendedName },
                    { find: 'onit-next-example-webcomponent', replace: answers.appNameWithoutScope }
                ];
            }
        }
    }
];
const exec = async (argv) => {
    const answers = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'repo',
            message: 'App Template repository',
            choices: repoChoices
        },
        {
            type: 'input',
            name: 'appName',
            message: 'App name (package.json name)',
            validate: (v) => {
                if (!v.match(nameMatch)) {
                    const msg = 'Invalid format. Avoid spaces, uppercase letters and special chars. Please follow the standard package.json name rules.';
                    return Promise.reject(new Error(msg));
                }
                return true;
            }
        },
        { type: 'input', name: 'appExtendedName', message: 'App short description' },
        {
            type: 'input',
            name: 'componentClassName',
            message: 'Component class name',
            default: (answers) => {
                return stringToComponentClassName(answers.appName);
            },
            validate: (v) => {
                //const _v = stringToComponentClassName(v);
                if (!v.match(/^([Oo]nit)[a-zA-Z0-9-_]+([Cc]omponent)$/)) {
                    return Promise.reject(new Error('Invalid format. Avoid spaces and special chars, use the format Onit[NAME]Component Please change it and continue.'));
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'databaseName',
            message: 'Database name for local serve',
            default: (answers) => {
                return (0, lodash_1.snakeCase)(answers.appName.replace(nameMatch, '$1')).replace(/_/g, '-');
            },
            validate: (v) => {
                if (!v.match(/^[a-zA-Z0-9-_]+$/)) {
                    return Promise.reject(new Error('Invalid format. Avoid spaces and special chars. Please change it and continue.'));
                }
                return true;
            }
        }
    ]);
    answers.appDescription = answers.appExtendedName;
    answers.componentClassNameShortCamelCase = (0, lodash_1.camelCase)(answers.componentClassName.substring(4));
    answers.componentNameExport = (0, lodash_1.snakeCase)(answers.componentClassName).toUpperCase();
    // console.warn('Component name: ' + answers.componentClassName);
    // check target directory
    answers.appNameWithoutScope = answers.appName.replace(/^@[^/]+\//, '');
    // console.warn('Name without scope: '+ answers.appNameWithoutScope);
    const directory = (0, path_1.join)(process.cwd(), './' + answers.appNameWithoutScope);
    if ((0, fs_1.existsSync)(directory)) {
        throw new Error(`Directory ${directory} already exists. Please select another name`);
    }
    // target directory does not exists. Good, nothing is going to be overwritten
    logger_1.logger.log('Clone empty project...');
    await (0, spawn_1.spawn)('git', ['clone', answers.repo.url, directory]);
    logger_1.logger.log('Unlinking git repository');
    await (0, git_1.unlinkGitRepo)(directory, answers);
    logger_1.logger.log('Fixing files...');
    // replace string values
    await (0, replaceValues_1.replaceValues)(directory, answers);
    // set package.json values
    await (0, fixPackageJson_1.fixPackageJson)(directory, answers);
    // remove some files
    await (0, removeUnwantedFiles_1.removeUnwantedFiles)(directory, answers);
    // fix onit config file
    await (0, fixOnitConfig_1.fixOnitConfig)(directory, answers);
    // replace some code lines
    await (0, replaceInFile_1.replaceInFile)((0, path_1.join)(directory, './src/client/routes/main.ts'), /^.+demoRouter.+;/mg, '');
    logger_1.logger.log('Commit changes...');
    await (0, git_1.commitRepo)(directory, answers);
    logger_1.logger.info('Component setup complete!');
    logger_1.logger.log('To launch the project, run');
    logger_1.logger.log(' > cd ' + answers.appNameWithoutScope);
    logger_1.logger.log(' > npm install');
    logger_1.logger.log(' > onit serve');
};
exports.default = exec;
//# sourceMappingURL=exec.js.map