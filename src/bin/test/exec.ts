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

import yargs from 'yargs';
import { logger } from '../../lib/logger';
import { onitFileLoader } from '../../lib/onitFileLoader';
import { CommandExecFunction, StringError } from '../../types';
import { selectTest } from './_lib/selectTest';
import { startTest } from './_lib/test';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    // check for manual serve file specifed
    const manualConfigFile = argv.c as string|undefined;

    // load the buildFile
    const onitConfigFile = await onitFileLoader(process.cwd(), manualConfigFile);
    logger.warn('Using config files: ' + onitConfigFile.sources.join(', '));

    if (!onitConfigFile.json.test) {
        throw new StringError('No test defined. You should have the test property in your onit configuration file: ' + onitConfigFile.sources.join(', '));
    }

    // prompt the user to elect a test set
    const testTarget = await selectTest(onitConfigFile);
        
    // quick replace the tag from testTarget
    const overrideMatchTag = argv.t as string | undefined;
    if (overrideMatchTag) {
        testTarget.grep = overrideMatchTag;
    }

    // launch test
    const returnCode = await startTest(onitConfigFile, testTarget, argv);

    // Just a fallback: onit might keep the process appended for internal events, but we 
    // wont to exit now. Just exit, discart everything else
    process.exit(returnCode);
};

export default exec;