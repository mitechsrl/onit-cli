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
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../lib/logger");
const persistent_1 = require("../../../../lib/persistent");
const exec = async (argv) => {
    var _a;
    const translateCfg = await (0, persistent_1.getPersistent)('translate');
    const services = (_a = (translateCfg !== null && translateCfg !== void 0 ? translateCfg : {}).translatorServices) !== null && _a !== void 0 ? _a : {};
    if (Object.keys(services).length === 0) {
        logger_1.logger.log('No service configured');
    }
    else {
        logger_1.logger.log('Available services');
        Object.keys(services).forEach(k => {
            logger_1.logger.log('- ' + k);
        });
    }
};
exports.default = exec;
//# sourceMappingURL=exec.js.map