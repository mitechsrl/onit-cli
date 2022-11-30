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
import { CommandExecFunction } from '../../../../../types';
import { getPersistent, setPersistent } from '../../../../../lib/persistent';
import inquirer from 'inquirer';
import { supportedTranslationProviders } from '../../_lib/supportedTranslationProviders';

async function askServiceProvider(){
    const p = await inquirer.prompt([{
        type: 'list',
        name: 'provider',
        message: 'Translation provider',
        choices: supportedTranslationProviders.map(p => ({ name: p.name, value: p }))
    }]);
    return p.provider;
}
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    //const translateCfg = await getPersistent('translate');
    //const services = (translateCfg ?? {}).translatorServices ?? {};

    const provider = await askServiceProvider();
    const config = await inquirer.prompt([
        { type:'input', name:'name', message:'Name' },
        ...provider.fields
    ]);
    const name = config.name;
    delete config.name;
    config.provider = provider.provider;

    let translateCfg = await getPersistent('translate');
    translateCfg = translateCfg ?? {};
    translateCfg.translatorServices = translateCfg.translatorServices ?? {};
    translateCfg.translatorServices[name] = config;

    console.log();
    await setPersistent('translate', translateCfg);
};

export default exec;