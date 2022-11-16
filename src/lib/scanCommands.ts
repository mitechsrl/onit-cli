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

import fs, { writeFileSync } from 'fs';
import path from 'path';

export type ScanCommandResult = {
    cmd: string,
    file: string,
    children: ScanCommandResult[]
};

/**
 * Scan the passed in directory searching for commandConfig.js files.
 *
 * @param dir 
 * @param name 
 * @returns A deep json with command paths and some infos
 */
export async function scanCommands(dir: string, name: string): Promise<ScanCommandResult[]> {

    const replace = path.join(__dirname, '../');
    const files = await fs.promises.readdir(dir);

    const scanResult: ScanCommandResult[] = [];

    for (const fileName of files) {
        if (fileName === 'commandConfig.js') {
            scanResult.push({
                cmd: name,
                file: path.posix.join(dir, fileName).replace(replace,''),
                children: []
            });
        }
    }

    const found = scanResult.length > 0;

    for (const fileName of files) {
        if (!fileName.startsWith('_')) {
            const f = path.posix.join(dir, fileName);
            const stat = await fs.promises.stat(f);
            if (stat.isDirectory()) {
                const _f = await scanCommands(f, fileName);
                if (found) {
                    scanResult[0].children.push(..._f);
                } else {
                    scanResult.push(..._f);
                }
            }
        }
    }

    return scanResult;
}

