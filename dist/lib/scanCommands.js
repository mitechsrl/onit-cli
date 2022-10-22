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
exports.scanCommands = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function scanCommands(dir, name) {
    const replace = path_1.default.join(__dirname, '../');
    const files = await fs_1.default.promises.readdir(dir);
    const scanResult = [];
    for (const fileName of files) {
        if (fileName === 'commandConfig.js') {
            scanResult.push({
                cmd: name,
                file: path_1.default.join(dir, fileName).replace(replace, ''),
                children: []
            });
        }
    }
    const found = scanResult.length > 0;
    for (const fileName of files) {
        if (!fileName.startsWith('_')) {
            const f = path_1.default.join(dir, fileName);
            const stat = await fs_1.default.promises.stat(f);
            if (stat.isDirectory()) {
                const _f = await scanCommands(f, fileName);
                if (found) {
                    scanResult[0].children.push(..._f);
                }
                else {
                    scanResult.push(..._f);
                }
            }
        }
    }
    return scanResult;
}
exports.scanCommands = scanCommands;
//# sourceMappingURL=scanCommands.js.map