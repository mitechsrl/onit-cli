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
import { spawn } from 'child_process';
import { GenericObject, OnitConfigFile } from '../../../../../types';
import { resolveNextBinImportPath } from './resolveNextBinImportPath';
import path from 'path';

export async function nextJsBuild (
    onitConfigFile: OnitConfigFile,
    cwdPackageJson: GenericObject,
    buildMode: string,  //'prduction'|'development',
    env?: GenericObject, // Values to add to env when spawning cli 
    argv?: yargs.ArgumentsCamelCase<unknown>) {

    // we just automatize the "next build" command. Checking for binary to be launched (will throw eventually)
    const binPath = resolveNextBinImportPath();

    // this is the directory where the folder "pages" is places.
    // This is relative to the onit.config.js file path 
    const nextDirectory = './next';
    
    // calculate the real path relative to onit.config.js
    const dir = path.join(onitConfigFile.sources[0],'../');
    let nextjsDir = path.join(dir,nextDirectory);
    nextjsDir = path.relative(dir, nextjsDir);
    
    const _env = Object.assign({}, env, {
        // Nextjs might complain about this for these reasons: https://nextjs.org/docs/messages/non-standard-node-env
        // Ignoring them now, this command is explicitly run in some specific mode
        // 06-09-2023: 'production' usabile solo con 'next build'
        //             'development' usabile solo con 'next dev'
        //             Ad oggi next non supporta l'uso di modalità diverse da 'production' con 'next build'.
        //             Ci teniamo il warning.
        NODE_ENV: buildMode
    });
    
    // binary found. Spawn it!
    return new Promise((resolve, reject) => {
        const ls = spawn('node', [binPath, 'build', nextjsDir], {
            env: _env,
            // ignore stdin, stdout & stderr just print out to the current cli session output 
            stdio: ['ignore', 'inherit', 'inherit']
        });
        ls.on('close', (code) => {
            if (code === 0) return resolve(undefined);
            reject({ info:'Next-cli exited with error code', code: code });
        });
    });
}

