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
import { resolve } from 'path';
import { logger } from '../../lib/logger';
import { onitFileLoader } from '../../lib/onitFileLoader';
import { CommandExecFunction, OnitDocumentationConfigFile } from '../../types';
import { generateDoc } from './_lib/generateDoc';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {

    // load the config file. 
    const projectPath = (argv.p ?? process.cwd()) as string;
    const config = await onitFileLoader(projectPath, 'onitdocumentation.config') as OnitDocumentationConfigFile;
    if (!config) throw new Error('File onitdocumentation.config.[js|json] not found');

    // check for manual serve file specifed
    const outputPath = resolve(projectPath, (argv.o ?? './onit-doc/') as string);

    logger.warn('Configuration file: ' + config.sources.join(', '));
    logger.warn('Scan directory: ' + projectPath);
    logger.warn('Output directory: ' + outputPath);
    
    await generateDoc(config.json, projectPath, outputPath);
   
};

export default exec;