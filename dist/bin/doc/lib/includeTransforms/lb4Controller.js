"use strict";
/**
 * Process a repository TS file and produces a markdown document
 * This processor just use the generic class one
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsClass_1 = __importDefault(require("./tsClass"));
class LB4ControllerParser extends tsClass_1.default {
    /**
     * Add a custom piece of markdown after the title. THis mainly prints out the decorators.
     * @param {*} method
     * @returns
     */
    renderMethodMarkdownAfterTitle(method) {
        const result = [];
        if (method.decorators.length > 0) {
            result.push('#### Decorators');
            method.decorators.forEach(d => {
                result.push('**' + d.name + '**');
                const signature = d.name + '(' + d.params.join(', ') + ')';
                result.push('```json\n' + signature + '\n```\n');
            });
        }
        return result;
    }
}
exports.default = LB4ControllerParser;
//# sourceMappingURL=lb4Controller.js.map