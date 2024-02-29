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
exports.updateVersion = exports.promptVersion = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const semver_1 = require("semver");
const spawn_1 = require("../../../../../lib/spawn");
const replace_1 = require("./replace");
/**
 * Display the version election
 *
 * @param buildTarget
 * @param vars
 * @param cwdPackageJson
 * @returns
 */
async function promptVersion(buildTarget, vars, cwdPackageJson) {
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
    if (!cwdPackageJson.version)
        throw new Error('No version field in package.json');
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
                name: 'Prossima ' + increaseLevel[0] + ' ' + (0, semver_1.inc)(cwdPackageJson.version, increaseLevel[0], undefined, increaseLevel[1]),
                value: (0, semver_1.inc)(cwdPackageJson.version, increaseLevel[0], undefined, increaseLevel[1])
            });
        });
        if (versionManagement.additional) {
            const _additional = (0, replace_1.replace)(versionManagement.additional, vars);
            console.log('Eseguo versionManagement additional: ' + _additional.cmd);
            let val = await (0, spawn_1.spawn)(_additional.cmd, [], {
                shell: true,
                print: false,
                cwd: process.cwd()
            });
            if (val.exitCode === 0) {
                let output = val.output.trim();
                // we can process both a single string or an array of version strings.
                // In case of array, get the next suitable version
                try {
                    const _match = output.match(/(\[[^\]]+\])|(^"[0-9.]+"$)/gm);
                    if (_match && _match[0])
                        output = _match[0];
                    let _val = JSON.parse(output);
                    if (Array.isArray(_val)) {
                        _val = _val.filter(v => !!v.match(additionalMatch));
                        _val = (0, semver_1.sort)(_val);
                        val = _val.pop();
                    }
                    else {
                        val = _val;
                    }
                }
                catch (e) {
                    console.error(e);
                }
                increaseLevels.forEach(increaseLevel => {
                    const v = (0, semver_1.inc)(output, increaseLevel[0], undefined, increaseLevel[1]);
                    if (v) {
                        list[0].choices.push({
                            name: versionManagement.additional.name + ' ' + increaseLevel[0] + ' ' + v,
                            value: v
                        });
                    }
                });
            }
        }
        const answers = await inquirer_1.default.prompt(list);
        version = answers.version;
    }
    return version;
}
exports.promptVersion = promptVersion;
/**
 * Update the package.json version before starting the build
 * @param cwdPackageJson
 * @param cwdPackageJsonFileName
 * @param version
 */
function updateVersion(cwdPackageJson, cwdPackageJsonFileName, version) {
    // on workspaces sometimes package-lock does not exists. It's the one from parent directory
    const cwdPackageLockJsonFileName = path_1.default.join(process.cwd(), 'package-lock.json');
    if (fs_1.default.existsSync(cwdPackageLockJsonFileName)) {
        const cwdPackageLockJson = JSON.parse(fs_1.default.readFileSync(cwdPackageLockJsonFileName).toString());
        cwdPackageLockJson.version = version;
        fs_1.default.writeFileSync(cwdPackageLockJsonFileName, JSON.stringify(cwdPackageLockJson, null, 4));
    }
    cwdPackageJson.version = version;
    fs_1.default.writeFileSync(cwdPackageJsonFileName, JSON.stringify(cwdPackageJson, null, 4));
}
exports.updateVersion = updateVersion;
//# sourceMappingURL=versionManagement.js.map