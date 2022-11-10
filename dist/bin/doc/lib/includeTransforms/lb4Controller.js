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
/**
 * Process a repository TS file and produces a markdown document
 * This processor just use the generic class one
 */
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