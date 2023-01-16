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
const logger_1 = require("../../lib/logger");
const onitFileLoader_1 = require("../../lib/onitFileLoader");
const path_1 = __importDefault(require("path"));
const loadVersionDir_1 = require("../../lib/loadVersionDir");
const exec = async (argv) => {
    var _a, _b, _c;
    try {
        // check for manual build file specifed
        const manualConfigFile = (_a = argv.c) !== null && _a !== void 0 ? _a : null;
        // load the buildFile
        const onitConfigFile = await (0, onitFileLoader_1.onitFileLoader)(process.cwd(), manualConfigFile);
        logger_1.logger.warn('Using config files: ' + onitConfigFile.sources.map(f => path_1.default.relative(process.cwd(), f)).join(', '));
        if (!onitConfigFile.json.build) {
            throw new Error('Build is not available. Check your onit config file at <build> property.');
        }
        // lock to the required builder version or get the most recent one
        const requiredVersion = (_c = (_b = onitConfigFile.json.build.version) !== null && _b !== void 0 ? _b : onitConfigFile.json.version) !== null && _c !== void 0 ? _c : '*';
        // get a list of the available versions (each dir describe one version)
        const versionsDir = path_1.default.join(__dirname, './_versions');
        // load a serve based on required version
        const build = (0, loadVersionDir_1.loadVersionDir)(versionsDir, requiredVersion, 'serve');
        // autoset the hardcoded params
        /*
        if (Array.isArray(onitConfigFile.json.build.params)) {
            params.push(...onitConfigFile.json.build.params);
        }*/
        await build.required.default(onitConfigFile, argv);
    }
    catch (e) {
        logger_1.logger.error('Build aborted');
        throw e;
    }
};
exports.default = exec;
//# sourceMappingURL=exec.js.map