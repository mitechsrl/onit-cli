/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

const spawn = require('../../../../../../lib/spawn');
const semverInc = require('semver/functions/inc');
const replace = require('./replace').replace;
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');

module.exports.prompt = async (buildTarget, vars, cwdPackageJson, targetDir) => {
    const versionManagement = buildTarget.version;
    const increaseLevel = buildTarget.mode === 'production' ? ['patch'] : ['prerelease', 'beta'];
    const when = buildTarget.mode === 'production' ? 'before' : 'after';
    let version = null;
    if (versionManagement && (versionManagement.propose !== false)) {
        const list = [{
            type: 'list',
            name: 'version',
            message: 'Gestione versione',
            choices: [{
                name: 'Mantieni attuale ' + cwdPackageJson.version,
                value: false
            }, {
                name: 'Incrementa a ' + semverInc(cwdPackageJson.version, ...increaseLevel),
                value: { [when]: semverInc(cwdPackageJson.version, ...increaseLevel) }
            }]
        }];

        const oldBuildPackageJson = path.join(targetDir, 'package.json');
        if (fs.existsSync(oldBuildPackageJson)) {
            const oldPackageJson = require(oldBuildPackageJson);
            const v = semverInc(oldPackageJson.version, ...increaseLevel);
            list[0].choices.push({
                name: 'Build precedente ' + oldPackageJson.version + ', incrementa a ' + v,
                value: { [when]: v }
            });
        }

        if (versionManagement.additional) {
            const _additional = replace(versionManagement.additional, vars);
            console.log('Eseguo versionManagement additional: ' + _additional.cmd);
            const ret = await spawn(_additional.cmd, [], false, {
                shell: true,
                cwd: process.cwd()
            });
            const v = semverInc(ret.data.trim(), increaseLevel);
            if (v) {
                list[0].choices.push({
                    name: versionManagement.additional.name + ' ' + v,
                    value: { [when]: v }
                });
            }
        }
        const answers = await inquirer.prompt(list);
        version = answers.version;
    }
    return version;
};

/**
 * Update the package.json version before starting the build
 *
 * @param {*} version
 */
module.exports.updateBefore = async (cwdPackageJson, cwdPackageJsonFileName, version) => {
    cwdPackageJson.version = version;
    const cwdPackageLockJsonFileName = path.join(process.cwd(), 'package-lock.json');
    const cwdPackageLockJson = require(cwdPackageLockJsonFileName);
    cwdPackageLockJson.version = version;
    fs.writeFileSync(cwdPackageJsonFileName, JSON.stringify(cwdPackageJson, null, 4));
    fs.writeFileSync(cwdPackageLockJsonFileName, JSON.stringify(cwdPackageLockJson, null, 4));
};

/**
 * Update the package version after the build, in detail the version is applied only to the compiled package
 *
 * @param {*} version
 */
module.exports.updateAfter = async (targetDir, version) => {
    const packageJsonFileName = path.join(targetDir, 'package.json');
    const packageLockJsonFileName = path.join(targetDir, 'package-lock.json');
    const packageJson = require(packageJsonFileName);
    const packageLockJson = require(packageLockJsonFileName);
    packageJson.version = version;
    packageLockJson.version = version;
    fs.writeFileSync(packageJsonFileName, JSON.stringify(packageJson, null, 4));
    fs.writeFileSync(packageLockJsonFileName, JSON.stringify(packageLockJson, null, 4));
};
