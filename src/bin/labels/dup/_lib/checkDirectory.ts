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
import _ from 'lodash';
import { logger } from '../../../../lib/logger';
import { GenericObject } from '../../../../types';

// This lib does not have typescript typings
// eslint-disable-next-line @typescript-eslint/no-var-requires
const globAll = require('glob-all');

export async function checkDirectory(dir: string) {

    // search for json files
    const options: GenericObject = {
        cwd: dir,
        ignore: [
            './**/node_modules/**/*',
            './**/package.json',
            './**/tsconfig.json'
        ]
    };
    let files: string[]= await promisify(globAll)(['./**/*.json'], options);
    // make sure we have absolute paths
    files = files.map(f=> resolve(dir, f));
    files.sort();

    let allLabels = {};

    files.forEach(filename => {
        
        const json: GenericObject = JSON.parse(fs.readFileSync(filename).toString());
        if (!json.labels) {
            // Not a labels file. Skip;
            return;
        }

        logger.log('Checking file ' + filename);
        const _allLabels: GenericObject = _.cloneDeep(allLabels);
        const map: GenericObject = json.labels.reduce((map: GenericObject, label: GenericObject) => {
            const k = label.page + label.label + label.language + label.applicationId;
            map[k] = map[k] || { label: label, count: 0 };
            map[k].count++;

            _allLabels[k] = _allLabels[k] || { label: label, count: 0 };
            _allLabels[k].count++;

            return map;
        }, {} as GenericObject);

        // do previous parsed files already had this label? if so, remove this one
        const previousFilesDuplicates = Object.keys(allLabels).filter(k => !!map[k]);
        previousFilesDuplicates.forEach(k => delete map[k]);
        const duplicates = Object.values(map).filter(m => m.count > 1);

        let doSave = false;
        if (previousFilesDuplicates.length > 0) {
            doSave = true;
            logger.log('Duplicates from other files: ' + previousFilesDuplicates.length);
        }
        if (duplicates.length > 0) {
            doSave = true;
            logger.log('Duplicates in the same file: ' + duplicates.length);
        }
        if (doSave) {
            json.labels = Object.values(map).map(m => m.label);
            if (json.labels.length === 0) {
                logger.warn('Output file is empty. The file will be removed.');
                fs.unlinkSync(filename);
            } else {
                fs.writeFileSync(filename, JSON.stringify(json, null, 4));
            }
        }

        allLabels = _allLabels;
            
    });

}
