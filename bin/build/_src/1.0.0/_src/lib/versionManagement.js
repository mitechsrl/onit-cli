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

const spawn = require('../../../../../../lib/spawn');
const semverInc = require('semver/functions/inc');
const semverSort = require('semver/functions/sort');
const replace = require('./replace').replace;
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const logger = require('../../../../../../lib/logger');

module.exports.prompt = async (buildTarget, vars, cwdPackageJson, targetDir) => {
    const versionManagement = buildTarget.version;
    let increaseLevel = null; // how to calculate next version
    let increaseLevelPreminor = null; // another way to calculate versions but only for test and dev
    let when = null;

    let append = '';
    let additionalMatch = null;
    switch (buildTarget.mode) {
    case 'production':
        append = '';
        additionalMatch = /^[0-9.]+$/;
        increaseLevel = ['patch'];
        increaseLevelPreminor = null;
        when = 'before'; break;
    case 'development':
        append = '-dev.0';
        additionalMatch = /^[0-9.]+-dev\.[0-9]+$/;
        increaseLevel = ['prerelease', 'dev'];
        increaseLevelPreminor = ['preminor', 'dev'];
        when = 'after'; break;
    case 'test':
        append = '-beta.0';
        additionalMatch = /^[0-9.]+-beta\.[0-9]+$/;
        increaseLevel = ['prerelease', 'beta'];
        increaseLevelPreminor = ['preminor', 'beta'];
        when = 'after'; break;
    }

    let version = null;
    if (versionManagement && (versionManagement.propose !== false)) {
        const list = [{
            type: 'list',
            name: 'version',
            message: 'Gestione versione. Attuale: ' + cwdPackageJson.version,
            choices: [{
                name: 'Mantieni attuale ' + cwdPackageJson.version,
                value: false
            }]
        }];

        // this allow us to create a dev/distribution of the current version
        if (append) {
            list[0].choices.push({
                name: 'Passa a ' + cwdPackageJson.version + append,
                value: { after: cwdPackageJson.version + append }
            });
        }

        if (increaseLevelPreminor) {
            const v = semverInc(cwdPackageJson.version, ...increaseLevelPreminor);
            list[0].choices.push({
                name: 'Prossima minor ' + v,
                value: { [when]: v }
            });
        }

        list[0].choices.push({
            name: 'Incrementa a ' + semverInc(cwdPackageJson.version, ...increaseLevel),
            value: { [when]: semverInc(cwdPackageJson.version, ...increaseLevel) }
        });
        const oldBuildPackageJson = path.join(targetDir, 'package.json');
        if (fs.existsSync(oldBuildPackageJson)) {
            const oldPackageJson = JSON.parse(fs.readFileSync(oldBuildPackageJson).toString());
            list[0].choices.push({
                name: 'Build precedente ' + oldPackageJson.version + ', mantieni ' + oldPackageJson.version,
                value: { [when]: oldPackageJson.version }
            });

            const v = semverInc(oldPackageJson.version, ...increaseLevel);
            list[0].choices.push({
                name: 'Build precedente ' + oldPackageJson.version + ', incrementa a ' + v,
                value: { [when]: v }
            });
        }

        if (versionManagement.additional) {
            const _additional = replace(versionManagement.additional, vars);
            console.log('Eseguo versionManagement additional: ' + _additional.cmd);
            let val = await spawn(_additional.cmd, [], false, {
                shell: true,
                cwd: process.cwd()
            });
            val = val.data.trim();

            // we can process both a single string or an array of version strings.
            // In case of array, get the next suitable version
            try {
                let _val = JSON.parse(val);
                if (Array.isArray(_val)) {
                    _val = _val.filter(v => !!v.match(additionalMatch));
                    _val = semverSort(_val);
                    val = _val.pop();
                } else {
                    val = _val;
                }
            } catch (e) {
                // logger.error(e);
            }

            const v = semverInc(val, ...increaseLevel);
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
    const packageJson = JSON.parse(fs.readFileSync(packageJsonFileName).toString());
    const packageLockJson = JSON.parse(fs.readFileSync(packageLockJsonFileName).toString());
    packageJson.version = version;
    packageLockJson.version = version;
    fs.writeFileSync(packageJsonFileName, JSON.stringify(packageJson, null, 4));
    fs.writeFileSync(packageLockJsonFileName, JSON.stringify(packageLockJson, null, 4));
};
