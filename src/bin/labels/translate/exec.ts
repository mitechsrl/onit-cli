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
import { CommandExecFunction, StringError } from '../../../types';
import { logger } from '../../../lib/logger';
import { translate } from './_lib/translate';
import { onitFileLoader } from '../../../lib/onitFileLoader';
import { getPersistent } from '../../../lib/persistent';
import inquirer from 'inquirer';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    // load the buildFile
    const onitConfigFile = await onitFileLoader(process.cwd());
    
    logger.warn('Using config files: ' + onitConfigFile.sources.join(', '));
    
    const translateCfg = await getPersistent('translate');
    if (!translateCfg.translatorServices) throw new StringError('No translation service configured. Use <onit labels translate services add>');

    const provider = await inquirer.prompt([{
        type:'list',
        name: 'provider',
        message:'Translation service',
        choices: Object.keys(translateCfg.translatorServices).map(k => ({
            name: k, value: translateCfg.translatorServices[k]
        }))
    }]);

    const serviceConfig = provider.provider;

    await translate(
        onitConfigFile,
        serviceConfig
    );
};

export default exec;