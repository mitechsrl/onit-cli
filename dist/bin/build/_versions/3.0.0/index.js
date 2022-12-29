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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../../lib/logger");
const inquirer_1 = __importDefault(require("inquirer"));
const versionManagement_1 = require("../2.0.0/lib/versionManagement");
const extraStepRuner_1 = require("../2.0.0/lib/extraStepRuner");
const build_1 = require("./lib/build");
/**
 * Exportin
 * @param onitConfigFile
 * @param argv
 * @returns
 */
async function build(onitConfigFile, argv) {
    var _a;
    // geth the package component at the current path
    const cwdPackageJsonFileName = path_1.default.join(process.cwd(), 'package.json');
    const cwdPackageJson = JSON.parse(fs_1.default.readFileSync(cwdPackageJsonFileName).toString());
    // check for buildTargets existence
    const buildTargets = (onitConfigFile.json.build || {}).targets || {};
    if (Object.keys(buildTargets).length === 0) {
        logger_1.logger.error('No defined build targets. Please check your onit config file for <build.targets> property');
        return;
    }
    // select build target. If only one buildTarget is available, use that one, show a selection prompt otherwise
    let buildTarget = null;
    if (Object.keys(buildTargets).length === 1) {
        const key = Object.keys(buildTargets)[0];
        buildTarget = buildTargets[key];
        buildTarget.key = key;
    }
    else {
        const list = [{
                type: 'list',
                name: 'buildTarget',
                message: 'Select build target',
                choices: Object.keys(buildTargets)
            }];
        const answers = await inquirer_1.default.prompt(list);
        buildTarget = buildTargets[answers.buildTarget];
        if (!buildTarget) {
            throw new Error('Error selecting build target!');
        }
        buildTarget.key = answers.buildTarget;
    }
    logger_1.logger.info('Selected build target: ' + buildTarget.key);
    const supportedBuildModes = ['production', 'uat', 'beta', 'test'];
    if (!supportedBuildModes.includes((_a = buildTarget.mode) !== null && _a !== void 0 ? _a : '')) {
        throw new Error('Build mode ' + buildTarget.mode + ' non supportato. Usa uno tra ' + supportedBuildModes.join(', '));
    }
    // prepare some vars for next steps
    const vars = {
        $_PROJECT_DIR: process.cwd(),
        $_PACKAGE_NAME: cwdPackageJson.name,
        $_PACKAGE_VERSION: cwdPackageJson.version
    };
    // ask the user for version
    const newPackageVersion = await (0, versionManagement_1.promptVersion)(buildTarget, vars, cwdPackageJson);
    // selector for extra steps (if available)
    let beforeSteps = (buildTarget.beforeSteps || []);
    if (beforeSteps.length > 0) {
        logger_1.logger.log('Select pre-build steps:');
        const list = beforeSteps.map((step, index) => ({
            type: 'confirm',
            name: 'step_' + index,
            message: 'Eseguire <' + step.name + '>?'
        }));
        const answers = await inquirer_1.default.prompt(list);
        beforeSteps = beforeSteps.filter((step, index) => answers['step_' + index]);
    }
    // selector for extra steps (if available)
    let afterSteps = (buildTarget.afterSteps || []);
    if (afterSteps.length > 0) {
        logger_1.logger.log('Select post-build steps:');
        const list = afterSteps.map((step, index) => ({
            type: 'confirm',
            name: 'step_' + index,
            message: 'Eseguire <' + step.name + '>?'
        }));
        const answers = await inquirer_1.default.prompt(list);
        afterSteps = afterSteps.filter((step, index) => answers['step_' + index]);
    }
    // update the package.json and package-lock.json versions if needed
    if (newPackageVersion) {
        (0, versionManagement_1.updateVersion)(cwdPackageJson, cwdPackageJsonFileName, newPackageVersion);
        vars.$_PACKAGE_VERSION = newPackageVersion;
    }
    // Removed while moving to typescript. This is not used anymore and has been a source of silent bugs for too much time.
    // It's time to kill it.
    // logger.log('Checking links...');
    // await links.start(onitConfigFile);
    // extra steps management
    if (beforeSteps.length > 0) {
        logger_1.logger.log('');
        logger_1.logger.log('Running pre-build steps...');
        for (const step of beforeSteps) {
            await (0, extraStepRuner_1.extraStepRunner)(step, vars);
        }
    }
    // effective build
    await (0, build_1.runBuild)(cwdPackageJson, buildTarget, onitConfigFile);
    // extra steps management
    if (afterSteps.length > 0) {
        logger_1.logger.log('');
        logger_1.logger.log('Running post-build steps...');
        for (const step of afterSteps) {
            await (0, extraStepRuner_1.extraStepRunner)(step, vars);
        }
    }
}
exports.default = build;
//# sourceMappingURL=index.js.map