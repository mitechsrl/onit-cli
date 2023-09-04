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
exports.npmVersionCheck = exports.npxExecutable = exports.npmExecutable = void 0;
const os_1 = __importDefault(require("os"));
const spawn_1 = require("./spawn");
const persistent_1 = require("./persistent");
const logger_1 = require("./logger");
const packageJson_1 = require("./packageJson");
const gt_1 = __importDefault(require("semver/functions/gt"));
// windows being windows... it wants the .cmd extension!
exports.npmExecutable = os_1.default.platform() === 'win32' ? 'npm.cmd' : 'npm';
exports.npxExecutable = os_1.default.platform() === 'win32' ? 'npx.cmd' : 'npx';
// after some time (1 minutes), just check for newer versions and show a info in the console
// This is just for a reminder, doesn't do anything else.
function npmVersionCheck() {
    const updateStatus = (0, persistent_1.getPersistent)('update');
    if (updateStatus === null || updateStatus === void 0 ? void 0 : updateStatus.update) {
        if (packageJson_1.packageJson.version === updateStatus.newversion) {
            // first run after update. The flag is still true, we need to reset it.
            updateStatus.update = false;
            (0, persistent_1.setPersistent)('update', updateStatus);
            return;
        }
        // still not updated
        logger_1.logger.warn('[ONIT-CLI UPDATE] A new version of onit-cli is available. Current: ' + packageJson_1.packageJson.version + ', newer: ' + updateStatus.newversion + '. Install with <npm install -g ' + packageJson_1.packageJson.name + '>');
    }
    // check for npm registry updates. Do it once each hour to prevent too many calls
    if ((!(updateStatus === null || updateStatus === void 0 ? void 0 : updateStatus.lastCheck)) || (((new Date().getTime() - new Date(updateStatus.lastCheck).getTime()) / 1000) > 3600)) {
        const t = setTimeout(() => {
            const npmParams = ['view', packageJson_1.packageJson.name, '--registry=https://registry.npmjs.org/', 'version'];
            (0, spawn_1.spawn)(exports.npmExecutable, npmParams, false, { shell: true, cwd: __dirname })
                .then(status => {
                status.output = status.output.trim();
                updateStatus.update = (0, gt_1.default)(status.output, packageJson_1.packageJson.version);
                if (updateStatus.update) {
                    updateStatus.newversion = status.output;
                }
                else {
                    updateStatus.newversion = packageJson_1.packageJson.version;
                }
                updateStatus.lastCheck = new Date().toISOString();
                (0, persistent_1.setPersistent)('update', updateStatus);
            })
                .catch(() => { });
        }, 60 * 1000);
        // detach this timer to it's own life, otherwise it might "block" the main event loop
        // and prevent this cli from exiting when commands finish
        t.unref();
    }
}
exports.npmVersionCheck = npmVersionCheck;
//# sourceMappingURL=npm.js.map