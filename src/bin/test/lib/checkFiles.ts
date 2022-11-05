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

import { existsSync } from 'fs';
import { join } from 'path';
import { OnitConfigFileTestTarget, StringError } from '../../../types';

/**
 * check for startup/beforetest/shutdown files existence
 * @param {*} testTarget
 * @param {*} testPath
 * @returns Object, the required files
 */
export function checkFiles (testTarget: OnitConfigFileTestTarget, testPath: string) {
    let startup = null;
    if (testTarget.startup) {
        const startupFilePath = join(testPath, testTarget.startup);
        if (!existsSync(startupFilePath)) {
            throw new StringError('File ' + startupFilePath + ' not found');
        }
        startup = require(startupFilePath);
        if (typeof startup.startup !== 'function') {
            throw new StringError('startup file must export a \'startup\' function');
        }
    }
    let beforeTest = null;
    if (testTarget.beforeTest) {
        const beforeTestFilePath = join(testPath, testTarget.beforeTest);
        if (!existsSync(beforeTestFilePath)) {
            throw new StringError('File ' + beforeTestFilePath + ' not found');
        }
        beforeTest = require(beforeTestFilePath);
        if (typeof beforeTest.beforeTest !== 'function') {
            throw new StringError('beforeTest file must export a \'beforeTest\' function');
        }
    }
    let shutdown = null;
    if (testTarget.shutdown) {
        const shutdownFilePath = join(testPath, testTarget.shutdown);
        if (!existsSync(shutdownFilePath)) {
            throw new StringError('File ' + shutdownFilePath + ' not found');
        }
        shutdown = require(shutdownFilePath);
        if (typeof shutdown.shutdown !== 'function') {
            throw new StringError('shutdown file must export a \'shutdown\' function');
        }
    }

    return {
        startup: startup,
        beforeTest: beforeTest,
        shutdown: shutdown
    };
}
