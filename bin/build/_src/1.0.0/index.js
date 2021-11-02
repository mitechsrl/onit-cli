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
const build = require('./_src/build');
const extraStepRunner = require('./_src/lib/extraStepRunner');
const versionManagement = require('./_src/lib/versionManagement');
const links = require('../../../../shared/1.0.0/lib/link');
const logger = require('../../../../lib/logger');

module.exports.start = async function (onitConfigFile, builderVersion, basepath, params) {
    // geth the package component at the current path
    const cwdPackageJsonFileName = path.join(process.cwd(), 'package.json');

    const cwdPackageJson = require(cwdPackageJsonFileName);

    // check for buildTargets existence
    // FIXME: 21-07-2021 buildTarget is deprecated. Use targets
    const buildTargets = (onitConfigFile.json.build || {}).targets || (onitConfigFile.json.build || {}).buildTargets || {};
    if (Object.keys(buildTargets).length === 0) {
        logger.error('Nessun build target definito. Verifica di aver definitio la proprietà <build.targets> nel tuoi file di conigurazione: ' + onitConfigFile.sources.join(', '));
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
            message: 'Seleziona un build target',
            choices: Object.keys(buildTargets)
        }];
        const answers = await inquirer.prompt(list);
        buildTarget = buildTargets[answers.buildTarget];
        if (!buildTarget) {
            throw new Error('Errore nella selezione del buildTarget');
        }
        buildTarget.key = answers.buildTarget;
    }
    logger.info('Build target selezionato: ' + buildTarget.key);

    const supportedBuildModes = ['production', 'development', 'test'];

    if (!supportedBuildModes.includes(buildTarget.mode)) {
        throw new Error('Build mode ' + buildTarget.mode + ' non supportato. Usa uno tra ' + supportedBuildModes.join(', '));
    }

    const targetDir = path.resolve(process.cwd(), './build/' + (buildTarget.key || buildTarget.mode));

    // prepare some vars for next steps
    const vars = {
        $_PROJECT_DIR: process.cwd(),
        $_PACKAGE_NAME: cwdPackageJson.name,
        $_PACKAGE_VERSION: cwdPackageJson.version
    };

    // ask the user for version
    const packageVersion = await versionManagement.prompt(buildTarget, vars, cwdPackageJson, targetDir);

    // selector for extra steps (if available)
    let extraSteps = (buildTarget.afterSteps || []);
    if (extraSteps.length > 0) {
        logger.log('Selezione step aggiuntivi post-build:');
        const list = extraSteps.map((step, index) => ({
            type: 'confirm',
            name: 'step_' + index,
            message: 'Eseguire <' + step.name + '>?'
        }));
        const answers = await inquirer.prompt(list);
        extraSteps = extraSteps.filter((step, index) => answers['step_' + index]);
    }

    logger.log('Verifico links...');
    await links.start(onitConfigFile);

    // update the package.json and package-lock.json versions if needed
    if (packageVersion && packageVersion.before) {
        versionManagement.updateBefore(cwdPackageJson, cwdPackageJsonFileName, packageVersion.before);
        vars.$_PACKAGE_VERSION = packageVersion.before;
    }

    // effective build
    await build.build(cwdPackageJson, buildTarget, targetDir, onitConfigFile);

    // set build dir in the vars
    vars.$_BUILD_DIR = targetDir;

    // update the package version after the build if needed
    if (packageVersion && packageVersion.after) {
        await versionManagement.updateAfter(targetDir, packageVersion.after);
        vars.$_PACKAGE_VERSION = packageVersion.after;
    }

    // extra steps management
    if (extraSteps.length > 0) {
        logger.log('');
        logger.log('Avvio esecuzione steps post-build');
        for (const step of extraSteps) await extraStepRunner(step, vars);
    }
};
