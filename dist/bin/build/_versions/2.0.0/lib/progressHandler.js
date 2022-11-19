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
exports.progressHandler = void 0;
const logger_1 = require("../../../../../lib/logger");
let _debounceMessage = '';
function progressHandler(componentName) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (percentage, message, ...args) => {
        if ((percentage < 0.99) && (message !== _debounceMessage)) {
            const p = (percentage * 100).toFixed(0);
            _debounceMessage = message;
            logger_1.logger.warn('[WEBPACK] ' + componentName + ' build ' + p + '% ' + message);
        }
    };
}
exports.progressHandler = progressHandler;
//# sourceMappingURL=progressHandler.js.map