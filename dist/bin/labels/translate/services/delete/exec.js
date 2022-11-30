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
const types_1 = require("../../../../../types");
const persistent_1 = require("../../../../../lib/persistent");
const inquirer_1 = __importDefault(require("inquirer"));
const exec = async (argv) => {
    const translateCfg = await (0, persistent_1.getPersistent)('translate');
    if (!translateCfg.translatorServices)
        throw new types_1.StringError('No translation service configured');
    const provider = await inquirer_1.default.prompt([{
            type: 'list',
            name: 'provider',
            message: 'Translation service',
            choices: Object.keys(translateCfg.translatorServices)
        }]);
    delete translateCfg.translatorServices[provider.provider];
    await (0, persistent_1.setPersistent)('translate', translateCfg);
};
exports.default = exec;
//# sourceMappingURL=exec.js.map