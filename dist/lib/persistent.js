"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPersistent = exports.getPersistent = exports.baseConfigDir = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.baseConfigDir = path_1.default.join(process.env.APPDATA, './mitech-cli');
/**
 * Check existence of dir for a gven key.
 * If not available, the dir is created
 * @param key
 */
function checkDir(key) {
    const mitechCliDbPath = exports.baseConfigDir;
    if (!fs_1.default.existsSync(mitechCliDbPath)) {
        fs_1.default.mkdirSync(mitechCliDbPath);
    }
    if (key) {
        const keyPath = path_1.default.join(mitechCliDbPath, './' + key);
        if (!fs_1.default.existsSync(keyPath)) {
            fs_1.default.mkdirSync(keyPath);
        }
    }
}
/**
 *
 * @param key
 * @param filename
 * @returns
 */
function getPersistent(key, filename) {
    checkDir(key);
    let _filename = exports.baseConfigDir;
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
 *
 * @param key
 * @param obj
 * @param filename
 */
function setPersistent(key, obj, filename) {
    checkDir(key);
    let _filename = exports.baseConfigDir;
    if (key) {
        _filename = path_1.default.join(_filename, './' + key);
    }
    _filename = path_1.default.join(_filename, './' + (filename || 'config.json'));
    fs_1.default.writeFileSync(_filename, JSON.stringify(obj, null, 4));
}
exports.setPersistent = setPersistent;
//# sourceMappingURL=persistent.js.map