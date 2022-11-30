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

import fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { GenericObject } from '../../../types';

// This lib does not have typescript typings
// eslint-disable-next-line @typescript-eslint/no-var-requires
const globAll = require('glob-all');

export type LabelFileInfo = {
    filename: string;
    content: GenericObject;
};

/**
 * Scan for label files in the specified directory
 * 
 * @param dir search in this directory (recursively)
 * @returns 
 */
export async function scanLabelsFiles(dir: string): Promise<LabelFileInfo[]>{

    // search for json files
    const options: GenericObject = {
        cwd: dir,
        ignore: [
            './**/node_modules/**/*',
            './**/package.json',
            './**/tsconfig.json'
        ]
    };
    let files: string[] = await promisify(globAll)(['./**/*.json'], options);
    // make sure we have absolute paths
    files = files.map(f=> resolve(dir, f));
    files.sort();

    return files.map(filename => {
        
        const json: GenericObject = JSON.parse(fs.readFileSync(filename).toString());
        if (!json.labels) {
            // Not a labels file. Skip;
            return null;
        }

        if (!Array.isArray(json.labels)){
            return null;
        }

        return {
            filename: filename,
            content: json
        };            
    }).filter(l => !!l) as LabelFileInfo[];

}
