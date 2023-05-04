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

import inquirer from 'inquirer';
import { camelCase, snakeCase, upperFirst } from 'lodash';
import yargs from 'yargs';
import { join } from 'path';
import { CommandExecFunction, GenericObject } from '../../../types';
import { existsSync } from 'fs';
import { logger } from '../../../lib/logger';
import { spawn } from '../../../lib/spawn';
import { commitRepo, unlinkGitRepo } from './_lib/git';
import { replaceValues } from './_lib/replaceValues';
import { fixPackageJson } from './_lib/fixPackageJson';
import { removeUnwantedFiles } from './_lib/removeUnwantedFiles';
import { fixOnitConfig } from './_lib/fixOnitConfig';
import { replaceInFile } from './_lib/replaceInFile';

// const nameMatch = /^(@[a-zA-Z0-9-_]+\/){0,1}([a-zA-Z0-9-_]+)$/g;
const nameMatch = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?([a-z0-9-~][a-z0-9-._~]*)$/g;

function stringToComponentClassName(appName: string) {
    let componentClassName = upperFirst(camelCase(appName.replace(nameMatch, '$1'))) ;
    if (!componentClassName.match(/^([Oo]nit)(.*)$/)){
        componentClassName = 'Onit'+upperFirst(componentClassName);
    }
    if (!componentClassName.match(/^(.*)([Cc]omponent)$/)){
        componentClassName = componentClassName+'Component';
    }
    return componentClassName;
}

const repoChoices = [
    {
        name: 'legacy',
        value: {
            url: 'https://github.com/mitechsrl/onit-next-example-webcomponent.git',
            replacer: (answers: GenericObject) => {
                return [ // find & replace in files di src
                    { find: 'OnitExampleWebComponent', replace: answers.componentClassName }, // nome classe componente
                    { find: 'ONIT_EXAMPLE_WEB_COMPONENT', replace: answers.componentNameExport }, // nome componente
                    { find: 'exampleWebComponent', replace: answers.componentClassNameShortCamelCase },
                    { find: 'ExampleWebComponent', replace: upperFirst(answers.componentClassNameShortCamelCase) },
                    { find: 'Onit example web component', replace: answers.appExtendedName },
                    { find: 'onit-next-example-webcomponent', replace: answers.appNameWithoutScope }
                ];
            }
        }
    },
    {
        name: 'next',
        value: {
            url: 'https://github.com/mitechsrl/onit-nextjs-template.git',
            replacer: (answers: GenericObject) => {
                return [ // find & replace in files di src
                    { find: '__APP_NAME', replace: answers.componentClassName }, // nome classe componente
                    { find: 'OnitNextJsTemplateComponent', replace: answers.componentClassName }, // nome classe componente
                    { find: '__WEB_MOUNT_PATH', replace: answers.componentClassNameShortCamelCase },
                    { find: '__APP_EXTENDED_NAME', replace: answers.appExtendedName },
                    { find: 'onit-nextjs-template-package-json-name', replace: answers.appNameWithoutScope }
                ];
            }
        }
    }
];

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    const answers = await inquirer.prompt([
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
            default: (answers: GenericObject) => {
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
            default: (answers: GenericObject) => {
                return snakeCase(answers.appName.replace(nameMatch, '$1')).replace(/_/g, '-');
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
    answers.componentClassNameShortCamelCase = camelCase(answers.componentClassName.substring(4));
    answers.componentNameExport = snakeCase(answers.componentClassName).toUpperCase();

    // console.warn('Component name: ' + answers.componentClassName);

    // check target directory
    answers.appNameWithoutScope = answers.appName.replace(/^@[^/]+\//, '');
    // console.warn('Name without scope: '+ answers.appNameWithoutScope);
    
    const directory = join(process.cwd(), './' + answers.appNameWithoutScope);
    if (existsSync(directory)) {
        throw new Error(`Directory ${directory} already exists. Please select another name`);
    }
    // target directory does not exists. Good, nothing is going to be overwritten
    logger.log('Clone empty project...');
    await spawn('git', ['clone', answers.repo.url, directory]);

    logger.log('Unlinking git repository');
    await unlinkGitRepo(directory, answers);

    logger.log('Fixing files...');
    // replace string values
    await replaceValues(directory, answers);
    // set package.json values
    await fixPackageJson(directory, answers);
    // remove some files
    await removeUnwantedFiles(directory, answers);
    // fix onit config file
    await fixOnitConfig(directory, answers);

    // replace some code lines
    await replaceInFile(
        join(directory, './src/client/routes/main.ts'),
        /^.+demoRouter.+;/mg,
        '');

    logger.log('Commit changes...');
    await commitRepo(directory, answers);

    logger.info('Component setup complete!');
    logger.log('To launch the project, run');
    logger.log(' > cd ' + answers.appNameWithoutScope);
    logger.log(' > npm install');
    logger.log(' > onit serve');
    
};

export default exec;