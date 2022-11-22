"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPersistent = exports.getPersistent = exports.baseConfigDir = void 0;
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
let baseConfigDir = path_1.default.join(os_1.default.homedir(), './.onit-cli');
exports.baseConfigDir = baseConfigDir;
/**
 * Check existence of dir for a gven key.
 * If not available, the dir is created
 * @param key
 */
function checkDir(key) {
    if (!fs_1.default.existsSync(baseConfigDir)) {
        fs_1.default.mkdirSync(baseConfigDir);
    }
    if (key) {
        const keyPath = path_1.default.join(baseConfigDir, './' + key);
        if (!fs_1.default.existsSync(keyPath)) {
            fs_1.default.mkdirSync(keyPath);
        }
    }
}
/**
 * Get the persistent file for a specified key
 *
 * @param key
 * @param filename
 * @returns
 */
function getPersistent(key, filename) {
    checkDir(key);
    let _filename = baseConfigDir;
    if (key) {
        _filename = path_1.default.join(_filename, './' + key);
    }
    _filename = path_1.default.join(_filename, './' + (filename || 'config.json'));
    if (!fs_1.default.existsSync(_filename)) {
        fs_1.default.writeFileSync(_filename, '{}');
        return {};
    }
    else {
        return JSON.parse(fs_1.default.readFileSync(_filename).toString());
    }
}
exports.getPersistent = getPersistent;
/**
 * Set the persisted value for a specified key
 *
 * @param key
 * @param obj
 * @param filename
 */
function setPersistent(key, obj, filename) {
    console.log("AAAAAAAAAAAAAAAAAAA setPersisent");
    checkDir(key);
    let _filename = baseConfigDir;
    if (key) {
        _filename = path_1.default.join(_filename, './' + key);
    }
    _filename = path_1.default.join(_filename, './' + (filename || 'config.json'));
    fs_1.default.writeFileSync(_filename, JSON.stringify(obj, null, 4));
}
exports.setPersistent = setPersistent;
//# sourceMappingURL=persistent.js.map