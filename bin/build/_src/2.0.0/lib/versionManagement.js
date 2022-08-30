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

const spawn = require('../../../../../lib/spawn');
const semverInc = require('semver/functions/inc');
const semverSort = require('semver/functions/sort');
const replace = require('../../../../../shared/1.0.0/lib/replace').replace;
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');

module.exports.prompt = async (buildTarget, vars, cwdPackageJson) => {
    const versionManagement = buildTarget.version;
    const increaseLevels = []; // keep sorted from lowest to higer
    let append = '';
    let additionalMatch = null;
    switch (buildTarget.mode) {
        case 'production':
            append = '';
            additionalMatch = /^[0-9.]+$/;
            increaseLevels.push(['patch']);
            increaseLevels.push(['minor']);
            increaseLevels.push(['major']);
            break;
        case 'uat':
            append = '-uat.0';
            additionalMatch = /^[0-9.]+-uat\.[0-9]+$/;
            increaseLevels.push(['prerelease', 'uat']);
            // increaseLevel2 = ['preminor', 'uat'];
            break;
        case 'beta':
            append = '-beta.0';
            additionalMatch = /^[0-9.]+-beta\.[0-9]+$/;
            increaseLevels.push(['prerelease', 'beta']);
            // increaseLevel2 = ['preminor', 'beta'];
            break;
        case 'test':
            append = '-test.0';
            additionalMatch = /^[0-9.]+-test\.[0-9]+$/;
            increaseLevels.push(['prerelease', 'test']);
            // increaseLevel2 = ['preminor', 'beta'];
            break;

        default: throw new Error('Unknown build mode ' + buildTarget.mode + '. Use one from: production, uat, beta, test.');
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
        if (append && !cwdPackageJson.version.match(additionalMatch)) {
            list[0].choices.push({
                name: 'Passa a ' + cwdPackageJson.version.split('-')[0] + append,
                value: cwdPackageJson.version + append
            });
        }

        increaseLevels.forEach(increaseLevel => {
            list[0].choices.push({
                name: 'Prossima ' + increaseLevel[0] + ' ' + semverInc(cwdPackageJson.version, ...increaseLevel),
                value: semverInc(cwdPackageJson.version, ...increaseLevel)
            });
        });

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

            increaseLevels.forEach(increaseLevel => {
                const v = semverInc(val, ...increaseLevel);
                if (v) {
                    list[0].choices.push({
                        name: versionManagement.additional.name + ' ' + increaseLevel[0] + ' ' + v,
                        value: v
                    });
                }
            });
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
module.exports.update = (cwdPackageJson, cwdPackageJsonFileName, version) => {
    // on workspaces sometimes package-lock does not exists. It's the one from parent directory
    const cwdPackageLockJsonFileName = path.join(process.cwd(), 'package-lock.json');

    if (fs.existsSync(cwdPackageLockJsonFileName)) {
        const cwdPackageLockJson = require(cwdPackageLockJsonFileName);
        cwdPackageLockJson.version = version;
        fs.writeFileSync(cwdPackageLockJsonFileName, JSON.stringify(cwdPackageLockJson, null, 4));
    }

    cwdPackageJson.version = version;
    fs.writeFileSync(cwdPackageJsonFileName, JSON.stringify(cwdPackageJson, null, 4));
};

