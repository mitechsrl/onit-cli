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
const path_1 = require("path");
const logger_1 = require("../../lib/logger");
const onitFileLoader_1 = require("../../lib/onitFileLoader");
const generateDoc_1 = require("./_lib/generateDoc");
const exec = async (argv) => {
    var _a, _b;
    // load the config file. 
    const projectPath = ((_a = argv.p) !== null && _a !== void 0 ? _a : process.cwd());
    const config = await (0, onitFileLoader_1.onitFileLoader)(projectPath, 'onitdocumentation.config');
    if (!config)
        throw new Error('File onitdocumentation.config.[js|json] not found');
    // check for manual serve file specifed
    const outputPath = (0, path_1.resolve)(projectPath, ((_b = argv.o) !== null && _b !== void 0 ? _b : './onit-doc/'));
    logger_1.logger.warn('Configuration file: ' + config.sources.join(', '));
    logger_1.logger.warn('Scan directory: ' + projectPath);
    logger_1.logger.warn('Output directory: ' + outputPath);
    await (0, generateDoc_1.generateDoc)(config.json, projectPath, outputPath);
};
exports.default = exec;
//# sourceMappingURL=exec.js.map