"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandConfig_1 = __importDefault(require("../serve/commandConfig"));
const config = {
    description: 'Short version of "serve" for lazy people.',
    exec: './exec',
    params: commandConfig_1.default.params
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map