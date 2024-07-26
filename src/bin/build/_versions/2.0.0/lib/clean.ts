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

import { logger } from '../../../../../lib/logger';
import { GenericObject, OnitConfigFile } from '../../../../../types';
import fse from 'fs-extra';
import fs from 'fs';
import { spawn } from '../../../../../lib/spawn';
import { npm } from '../../../../../lib/npm';

/**
 * Ensure path does not exist
 * @param {*} localPath
 */
function removePath(localPath: string){
    if (fse.pathExistsSync(localPath)) {
        logger.log('Remove ' + localPath);
        fse.removeSync(localPath);
    }
}

/**
 * Ensure the passed in files does not exist
 */
function removeFiles(files:string[]){
    files.forEach(f => {
        if (fs.existsSync(f)) {
            logger.log('Remove ' + f);
            fs.unlinkSync(f);
        }
    });
}

/**
 * Clean the build directory
 * 
 * @param onitConfigFile 
 * @param cwdPackageJson 
 * @returns 
 */
export async function runClean(onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject) {
    logger.info('[CLEAN] Cleaning directory...');

    // if defined, launch the clean script
    if ((cwdPackageJson.scripts || {}).clean) {
        await npm(['run', 'clean'], {
            cwd: process.cwd()
        });
    }

    // Also remove by default some of our own dir/files
    removePath('dist-fe');
    removePath('dist');
    removeFiles(['tsconfig.tsbuildinfo']);

    logger.info('[CLEAN] Directory cleaned!');

    return 0;
}
