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
import { CommandExecFunction } from '../../types';
import fs from 'fs';
import path from 'path';
import maxSatisfying from 'semver/ranges/max-satisfying';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    try {
        // check for manual serve file specifed
        const manualConfigFile: string | null = (argv.c as string) ?? null;

        // load the buildFile
        
        const onitConfigFile = await onitFileLoader(process.cwd(), manualConfigFile);
        logger.warn('Uso file(s) config ' + onitConfigFile.sources.join(', '));

        if (!onitConfigFile.json.serve) {
            throw new Error('Il serve non è disponibile. Verifica di avere la proprietà <serve> nel file di configurazioen di onit.');
        }
        // lock to the required builder version or get the most recent one
        const requiredVersion = onitConfigFile.json.serve.version ?? '*';

        // get a list of the available versions (each dir describe one version)
        const availableVersions = fs.readdirSync(path.join(__dirname, './versions'));

        // use npm semver to select the most recent usable version
        const version = maxSatisfying(availableVersions, requiredVersion);

        if (!version){
            throw new Error('No compatible server version found for required ' + requiredVersion + '. Check your onit config file serve.version value.');
        }

        // version found: Load that builder and use it.
        logger.info('Uso serve V' + version);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serve = require(path.join(__dirname, './versions/' + version + '/index.js'));

        // autoset the hardcoded params
        /*
        if (Array.isArray(onitConfigFile.json.serve.params)) {
            params.push(...onitConfigFile.json.serve.params);
        }*/

        await serve.start(onitConfigFile, version, argv);
    } catch (e) {
        logger.error('Serve interrotto');
        throw e;
    }
};

export default exec;