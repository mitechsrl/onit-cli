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
const logger_1 = require("../../lib/logger");
const onitFileLoader_1 = require("../../lib/onitFileLoader");
const selectTest_1 = require("./_lib/selectTest");
const exec = async (argv) => {
    try {
        // check for manual serve file specifed
        const manualConfigFile = argv.c;
        // load the buildFile
        const onitConfigFile = await (0, onitFileLoader_1.onitFileLoader)(process.cwd(), manualConfigFile);
        logger_1.logger.warn('Uso file(s) config ' + onitConfigFile.sources.join(', '));
        if (!onitConfigFile.json.test) {
            throw new Error('Il test non è disponibile. Verifica di avere la proprietà <test> nel file di configurazioen di onit.');
        }
        // prompt the user to elect a test set
        const testTarget = await (0, selectTest_1.selectTest)(onitConfigFile);
        const test = require('./_src/index');
        // quick replace the tag from testTarget
        const overrideMatchTag = argv.t;
        if (overrideMatchTag) {
            testTarget.grep = overrideMatchTag;
        }
        // launch test
        await test.start(onitConfigFile, testTarget, basepath, params);
    }
    catch (e) {
        logger_1.logger.error('Test interrotto');
        throw e;
    }
};
exports.default = exec;
//# sourceMappingURL=exec.js.map