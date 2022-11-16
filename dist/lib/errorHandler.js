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
exports.errorHandler = void 0;
const types_1 = require("../types");
const logger_1 = require("./logger");
function errorHandler(error, argv) {
    // on verbose, print all the error
    if (argv === null || argv === void 0 ? void 0 : argv.verbose) {
        logger_1.logger.error(error);
        return;
    }
    // Simple StringError. Print only message, skip stack
    if (error instanceof types_1.StringError) {
        logger_1.logger.error(error.message);
        return;
    }
    // Something was not found. The error message should already contain all the needed info
    // no need to print stack trace.
    if (error instanceof types_1.NotFoundError) {
        logger_1.logger.error(error.message);
        return;
    }
    // any other case will also print stack trace
    logger_1.logger.error(error);
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map