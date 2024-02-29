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

import { spawn as _spawn, SpawnOptionsWithStdioTuple, StdioNull,StdioPipe, SpawnOptionsWithoutStdio } from 'child_process';
import { GenericObject } from '../types';

export type SpawnResult = {
    exitCode: number,
    output: string
};

export type SpawnOptions = { print?:boolean } & (SpawnOptionsWithoutStdio | SpawnOptionsWithStdioTuple<StdioNull|StdioPipe, StdioNull|StdioPipe, StdioNull|StdioPipe>);

/**
 * Process spawn helper. Proxy method to child_process.spawn to promisifize it and apply some custom logic
 *
 * @param cmd Command to be run
 * @param params Array of strings for parameters
 * @param print print command output to console. Default to true.
 * @param options SpawnOptionsWithoutStdio object. See node child_process docs
 * @returns SpawnResult object {exitCode:number, output:stirng}
 */
export async function spawn(
    cmd: string, 
    params: string[], 
    options?: SpawnOptions ): Promise<SpawnResult> {
    return new Promise((resolve, reject) => {
        const proc = _spawn(cmd, params ?? [], options as GenericObject);

        let _data = Buffer.from('');
        proc.stdout?.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (options?.print !== false) { 
                process.stdout.write(data);
            }
        });

        proc.stderr?.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (options?.print !== false) { 
                process.stderr.write(data);
            }
        });

        proc.on('close', (code: number) => {
            return resolve({
                exitCode: code, 
                output: _data.toString()
            });
        });

        proc.on('error', (err) => {
            return reject(err);
        });
    });
}

