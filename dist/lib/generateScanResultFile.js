"use strict";
/**
 * Create the json commands report file
 * This script is called at build time
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const scanCommands_1 = require("./scanCommands");
/**
 * Script chiamato dopo la build per generare json dei comandi
 */
(0, scanCommands_1.scanCommands)(path_1.default.join(process.cwd(), './dist/bin'), '')
    .then((commands) => {
    const file = path_1.default.join(__dirname, '../../dist/commands.json');
    (0, fs_1.writeFileSync)(file, JSON.stringify(commands, null, 4));
});
//# sourceMappingURL=generateScanResultFile.js.map