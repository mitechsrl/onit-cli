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
const persistent_1 = require("../../../../../lib/persistent");
const inquirer_1 = __importDefault(require("inquirer"));
// list of supported providers
const providers = [{
        provider: 'azure',
        name: 'Microsoft Azure translator',
        fields: [
            // this is the inquirer config to ask for additional values
            { type: 'input', name: 'key', message: 'Rest api key' },
            { type: 'input', name: 'location', message: 'Cloud service location/area' }
        ]
    }];
async function askServiceProvider() {
    const p = await inquirer_1.default.prompt([{
            type: 'list',
            name: 'provider',
            message: 'Translation provider',
            choices: providers.map(p => ({ name: p.name, value: p }))
        }]);
    return p.provider;
}
const exec = async (argv) => {
    //const translateCfg = await getPersistent('translate');
    //const services = (translateCfg ?? {}).translatorServices ?? {};
    var _a;
    const provider = await askServiceProvider();
    const config = await inquirer_1.default.prompt([
        { type: 'input', name: 'name', message: 'Name' },
        ...provider.fields
    ]);
    const name = config.name;
    delete config.name;
    config.provider = provider.provider;
    let translateCfg = await (0, persistent_1.getPersistent)('translate');
    translateCfg = translateCfg !== null && translateCfg !== void 0 ? translateCfg : {};
    translateCfg.translatorServices = (_a = translateCfg.translatorServices) !== null && _a !== void 0 ? _a : {};
    translateCfg.translatorServices[name] = config;
    console.log();
    await (0, persistent_1.setPersistent)('translate', translateCfg);
};
exports.default = exec;
//# sourceMappingURL=exec.js.map