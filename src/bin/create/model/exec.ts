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

import inquirer from 'inquirer';
import yargs from 'yargs';
import { CommandExecFunction } from '../../../types';
import { repoGenerator } from '../repository/exec';
import { CustomModelGenerator } from './lib/CustomModelGenerator';

// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ModelGenerator = require('@loopback/cli/generators/model/index');

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    const modelGenerator = new CustomModelGenerator();

    // NOTE: the orignal class methods were run with yeoman.
    // Yeoman runs sequentially the class mehods. Imitating it with this code.
    for (const method of Object.getOwnPropertyNames(ModelGenerator.prototype)) {
        // NOTE1: skipping checkLoopBackProject to avoid dependency checks. We just need to create the model file
        // NOTE2: skipping methods starting with _. Those are private.
        if (['constructor', 'checkLoopBackProject'].includes(method) || method.startsWith('_')) continue;

        await modelGenerator[method]();
    }

    // Ask the user if he wants to create the relative repository
    const answers = await inquirer.prompt([{ type: 'confirm', name: 'createRepo', message: 'Do you want to create a repository for this model?', default: false }]);
    if (answers.createRepo) {
        // pass these values to the repo generators, so we can skip inquirer prompts
        const presets = {
            modelNameList: [modelGenerator.artifactInfo.className],
            mixins: modelGenerator.artifactInfo.mixins,
            idProperty: Object.keys(modelGenerator.artifactInfo.properties).find(k => {
                if (modelGenerator.artifactInfo.properties[k].id) return true;
                return false;
            })
        };
        await repoGenerator(presets);
    }
};

export default exec;