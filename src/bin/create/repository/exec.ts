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
import { CommandExecFunction, GenericObject } from '../../../types';
import { CustomRepositoryGenerator } from './lib/CustomRepositoryGenerator';

// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RepositoryGenerator = require('@loopback/cli/generators/repository/index');

/**
 * Prompt the user for repository generation
 * 
 * @param repoGeneratorParams 
 */
export async function repoGenerator (repoGeneratorParams?: GenericObject) {
    const repoGenerator = new CustomRepositoryGenerator();
    if (repoGeneratorParams) repoGenerator.presetValues(repoGeneratorParams);

    // NOTE: the orignal class methods were run with yeoman.
    // Yeoman runs sequentially the class mehods. Imitating it with this code.
    for (const method of Object.getOwnPropertyNames(RepositoryGenerator.prototype)) {
        // NOTE1: skipping checkLoopBackProject to avoid dependency checks. We just need to create the model file
        // NOTE2: skipping methods starting with _. Those are private.
        if (['constructor', 'checkLoopBackProject'].includes(method) || method.startsWith('_')) continue;

        await repoGenerator[method]();
    }
}

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    await repoGenerator();
};

export default exec;