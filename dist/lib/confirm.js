"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirm = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
/**
 * Quick function to prompt a confirm using inquirer
 * @param msg
 * @returns
 */
async function confirm(msg) {
    const answers = await inquirer_1.default.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: msg
        }]);
    return answers.confirm;
}
exports.confirm = confirm;
//# sourceMappingURL=confirm.js.map