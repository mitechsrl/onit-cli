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

const path = require('path');
const inquirer = require('inquirer');
const build = require('./lib/build');
const extraStepRunner = require('../../../../shared/1.0.0/lib/extraStepRunner');
const versionManagement = require('./lib/versionManagement');
const links = require('../../../../shared/1.0.0/lib/link');
const logger = require('../../../../lib/logger');

module.exports.start = async function (onitConfigFile, builderVersion, basepath, params) {
    // geth the package component at the current path
    const cwdPackageJsonFileName = path.join(process.cwd(), 'package.json');
    const cwdPackageJson = require(cwdPackageJsonFileName);

    // check for buildTargets existence
    const buildTargets = (onitConfigFile.json.build || {}).targets || {};
    if (Object.keys(buildTargets).length === 0) {
        logger.error('Nessun build target definito. Verifica di aver definito la proprietà <build.targets> nel tuoi file di conigurazione: ' + onitConfigFile.sources.join(', '));
        return;
    }

    // select build target. If only one buildTarget is available, use that one, show a selection prompt otherwise
    let buildTarget = null;
    if (Object.keys(buildTargets).length === 1) {
        const key = Object.keys(buildTargets)[0];
        buildTarget = buildTargets[key];
        buildTarget.key = key;
    } else {
        const list = [{
            type: 'list',
            name: 'buildTarget',
            message: 'Select build target',
            choices: Object.keys(buildTargets)
        }];
        const answers = await inquirer.prompt(list);
        buildTarget = buildTargets[answers.buildTarget];
        if (!buildTarget) {
            throw new Error('Error selecting build target!');
        }
        buildTarget.key = answers.buildTarget;
    }

    logger.info('Selected build target: ' + buildTarget.key);

    const supportedBuildModes = ['production', 'development', 'test'];

    if (!supportedBuildModes.includes(buildTarget.mode)) {
        throw new Error('Build mode ' + buildTarget.mode + ' non supportato. Usa uno tra ' + supportedBuildModes.join(', '));
    }

    // prepare some vars for next steps
    const vars = {
        $_PROJECT_DIR: process.cwd(),
        $_PACKAGE_NAME: cwdPackageJson.name,
        $_PACKAGE_VERSION: cwdPackageJson.version
    };

    // ask the user for version
    const newPackageVersion = await versionManagement.prompt(buildTarget, vars, cwdPackageJson);

    // selector for extra steps (if available)
    let beforeSteps = (buildTarget.beforeSteps || []);
    if (beforeSteps.length > 0) {
        logger.log('Select pre-build steps:');
        const list = beforeSteps.map((step, index) => ({
            type: 'confirm',
            name: 'step_' + index,
            message: 'Eseguire <' + step.name + '>?'
        }));
        const answers = await inquirer.prompt(list);
        beforeSteps = beforeSteps.filter((step, index) => answers['step_' + index]);
    }

    // selector for extra steps (if available)
    let afterSteps = (buildTarget.afterSteps || []);
    if (afterSteps.length > 0) {
        logger.log('Select post-build steps:');
        const list = afterSteps.map((step, index) => ({
            type: 'confirm',
            name: 'step_' + index,
            message: 'Eseguire <' + step.name + '>?'
        }));
        const answers = await inquirer.prompt(list);
        afterSteps = afterSteps.filter((step, index) => answers['step_' + index]);
    }

    logger.log('Checking links...');
    await links.start(onitConfigFile);

    // update the package.json and package-lock.json versions if needed
    if (newPackageVersion) {
        versionManagement.update(cwdPackageJson, cwdPackageJsonFileName, newPackageVersion);
        vars.$_PACKAGE_VERSION = newPackageVersion;
    }

    // extra steps management
    if (beforeSteps.length > 0) {
        logger.log('');
        logger.log('Running pre-build steps...');
        for (const step of beforeSteps) await extraStepRunner(step, vars);
    }

    // effective build
    await build.build(cwdPackageJson, buildTarget, onitConfigFile);

    // extra steps management
    if (afterSteps.length > 0) {
        logger.log('');
        logger.log('Running post-build steps...');
        for (const step of afterSteps) await extraStepRunner(step, vars);
    }
};
