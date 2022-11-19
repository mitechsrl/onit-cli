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

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    const nameMatch = /^(@[a-zA-Z0-9-_]+\/){0,1}([a-zA-Z0-9-_]+)$/g;
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'appName',
            message: 'App name (package.json name)',
            validate: (v) => {
                if (!v.match(nameMatch)) {
                    return Promise.reject(new Error('Invalid format. Avoid spaces and special chars. Package scope is allowed. Please change it and continue.'));
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
                return 'Onit' + upperFirst(camelCase(answers.appName.replace(nameMatch, '$2'))) + 'Component';
            },
            validate: (v) => {
                if (!v.match(/^[a-zA-Z0-9-_]+$/g)) {
                    return Promise.reject(new Error('Invalid format. Avoid spaces and special chars. Please change it and continue.'));
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'databaseName',
            message: 'Database name for local serve',
            default: (answers: GenericObject) => {
                return snakeCase(answers.appName.replace(nameMatch, '$2')).replace(/_/g, '-');
            }
        }
    ]);

    answers.appDescription = answers.appExtendedName;

    // Ensure some names starts with "Onit"
    if (answers.componentClassName.toLowerCase().startsWith('onit')) {
        answers.componentClassNameShortCamelCase = camelCase(answers.componentClassName.substring(4));
        answers.componentClassName = upperFirst(camelCase(answers.componentClassName));
    } else {
        answers.componentClassNameShortCamelCase = camelCase(answers.componentClassName);
        answers.componentClassName = 'Onit' + upperFirst(camelCase(answers.componentClassName));
    }

    // Ensure some names ends in "Component"
    if (answers.componentClassName.match(/^(.+)([Cc]omponent)$/gi)) {
        answers.componentClassName = answers.componentClassName.replace(/^(.+)([Cc]omponent)$/gi, '$1Component');
    } else {
        answers.componentClassName += 'Component';
    }
    if (answers.componentClassNameShortCamelCase.match(/^(.+)([Cc]omponent)$/gi)) {
        answers.componentClassNameShortCamelCase = answers.componentClassNameShortCamelCase.replace(/^(.+)([Cc]omponent)$/gi, '$1Component');
    } else {
        answers.componentClassNameShortCamelCase += 'Component';
    }

    answers.componentNameExport = snakeCase(answers.componentClassName).toUpperCase();

    console.warn('Component name: ' + answers.componentClassName);

    // check target directory
    answers.appNameWithoutScope = answers.appName.replace(/^@[^/]+\//, '');
    console.warn('Name without scope: ' + answers.appNameWithoutScope);

    const directory = join(process.cwd(), './' + answers.appNameWithoutScope);
    if (existsSync(directory)) {
        throw new Error(`Directory ${directory} already exists. Please select another name`);
    }
    // target directory does not exists. Good, nothing is going to be overwritten
    logger.log('Clone empty project...');
    await spawn('git', ['clone', 'https://github.com/mitechsrl/onit-next-example-webcomponent.git', directory]);

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