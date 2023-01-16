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
import fs from 'fs';
import path from 'path';
import maxSatisfying from 'semver/ranges/max-satisfying';
import { loadVersionDir } from '../../lib/loadVersionDir';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    try {
        // check for manual serve file specifed
        const manualConfigFile: string | null = (argv.c as string) ?? null;

        // load the config file
        const onitConfigFile = await onitFileLoader(process.cwd(), manualConfigFile);
        logger.warn('Using config files: ' + onitConfigFile.sources.join(', '));
        if (!onitConfigFile.json.serve) {
            throw new Error('Serve is not available. Check your onit config file at <serve> property.');
        }

        // lock to the required builder version or get the most recent one
        const requiredVersion = onitConfigFile.json.serve.version ?? onitConfigFile.json.version ?? '*';

        // get a list of the available versions (each dir describe one version)
        const versionsDir = path.join(__dirname, './_versions');
        // load a serve based on required version
        const serve = loadVersionDir(versionsDir, requiredVersion, 'serve');
    
        // autoset the hardcoded params
        /*
        if (Array.isArray(onitConfigFile.json.serve.params)) {
            params.push(...onitConfigFile.json.serve.params);
        }*/

        await serve.required.start(onitConfigFile, serve.version, argv);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        logger.log('');
        if (e.message){
            logger.error(e.message);
        }
        // print out stack trace only in verbose mode
        logger.verbose(JSON.stringify(e.stack ?? e, null, 4));
        throw new StringError('Serve aborted');
    }
};

export default exec;