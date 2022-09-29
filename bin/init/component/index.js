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

const { existsSync } = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const spawn = require('../../../lib/spawn');
const logger = require('../../../lib/logger');
const { replaceValues } = require('./_lib/replaceValues');
const { fixPackageJson } = require('./_lib/fixPackageJson');
const { removeUnwantedFiles } = require('./_lib/removeUnwantedFiles');
const { relpaceInFile } = require('./_lib/replaceInFile');
const { capitalize, camelCase } = require('lodash');
const { fixOnitConfig } = require('./_lib/fixOnitConfig');

module.exports.info = 'Project related init utilities';
module.exports.help = [
    `Create an new empty onit component by cloning the @mitech/onit-next-example-webcomponent repository.
    NOTE: this command requires read permissions on such repository`
];

module.exports.cmd = async function (basepath, params) {
    // await spawn('git', ['clone', 'https://github.com/mitechsrl/onit-next-example-webcomponent.git','ciaooo']);

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'appName',
            message: 'App name (package.json name)',
            validate: (v) => {
                if (!v.match(/^(@[a-zA-Z0-9-_]+\/){0,1}[a-zA-Z0-9-_]+$/g)) {
                    return Promise.reject(new Error('Invalid name. Please change it and continue.'));
                }
                return true;
            }
        },
        { type: 'input', name: 'appExtendedName', message: 'App extended name' },
        { type: 'input', name: 'appDescription', message: 'App description' },
        {
            type: 'input',
            name: 'componentClassName',
            message: 'Component class name',
            validate: (v) => {
                if (!v.match(/^[a-zA-Z0-9-_]+$/g)) {
                    return Promise.reject(new Error('Invalid name. Please change it and continue.'));
                }
                return true;
            }
        },
        { type: 'input', name: 'databaseName', message: 'Database name' }
    ]);

    // standardize class name
    // - CamelCase
    // - ends with "Component"
    answers.componentClassName = capitalize(camelCase(answers.componentClassName));
    if (answers.componentClassName.match(/^(.+)([Cc]omponent)$/gi)) {
        answers.componentClassName = answers.componentClassName.replace(/^(.+)([Cc]omponent)$/gi, '$1Component');
    } else {
        answers.componentClassName += 'Component';
    }

    console.warn('Component name: ' + answers.componentClassName);

    // check target directory
    answers.appNameWithoutScope = answers.appName.replace(/^@[^/]+\//, '');
    console.warn('name without scope: ' + answers.appNameWithoutScope);
    const directory = path.join(process.cwd(), './' + answers.appNameWithoutScope);
    if (existsSync(directory)) {
        throw new Error(`Directory ${directory} already exists. Please select another name`);
    }
    // target directory does not exists. Good, nothing is going to be overwritten
    logger.log('Clone empty project...');
    await spawn('git', ['clone', 'https://github.com/mitechsrl/onit-next-example-webcomponent.git', directory]);

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
    await relpaceInFile(
        path.join(directory, './src/client/routes/main.ts'),
        /^.+demoRouter.+;/mg,
        '');

    logger.info('Component setup complete!');
    logger.log('To launch the project, run');
    logger.log(' > npm install');
    logger.log(' > onit serve');
};
