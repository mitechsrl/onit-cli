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
exports.npx = exports.npm = exports.npmVersionCheck = void 0;
const os_1 = __importDefault(require("os"));
const packageJson_1 = require("./packageJson");
const simple_update_notifier_1 = __importDefault(require("simple-update-notifier"));
const spawn_1 = require("./spawn");
// windows being windows... it wants the .cmd extension!
const npmExecutable = os_1.default.platform() === 'win32' ? 'npm.cmd' : 'npm';
const npxExecutable = os_1.default.platform() === 'win32' ? 'npx.cmd' : 'npx';
/**
 * Check for newer versions and show a info in the console
 * This is just for a reminder, doesn't do anything else.
 * Check is performed once a day
 */
async function npmVersionCheck() {
    await (0, simple_update_notifier_1.default)({ pkg: packageJson_1.packageJson, updateCheckInterval: 1000 * 60 * 60 * 24 });
}
exports.npmVersionCheck = npmVersionCheck;
/**
 * Proxy method to spawn npm process
 */
async function npm(params, options) {
    return (0, spawn_1.spawn)(npmExecutable, params, Object.assign({ shell: true }, options !== null && options !== void 0 ? options : {}));
}
exports.npm = npm;
/**
 * Proxy method to spawn npx process
 */
async function npx(params, options) {
    return (0, spawn_1.spawn)(npxExecutable, params, Object.assign({ shell: true }, options !== null && options !== void 0 ? options : {}));
}
exports.npx = npx;
//# sourceMappingURL=npm.js.map