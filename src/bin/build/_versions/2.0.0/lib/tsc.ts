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
import { npm, npx } from '../../../../../lib/npm';
import { spawn } from '../../../../../lib/spawn';
import { GenericObject, OnitConfigFile } from '../../../../../types';
import { copyExtraFiles } from './copyExtraFiles';

export async function runTsc(onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject) {
    logger.log('[TSC] Starting tsc build...');

    // run the user build script if any, otherwise just run the loopback tsc compiler (which btw is
    // the default implementation of 'npm run build' for loopback 4 projects)
    let r = null;
    if (typeof (cwdPackageJson.scripts || {}).build === 'string') {
        r = await npm(['run', 'build']);
    } else {
        r = await npx(['lb-tsc']);
    }

    // TODO: verificare se cambia qualcosa da powershell ad altre shells
    if (r.exitCode !== 0) {
        throw new Error('Build failed');
    }

    // tsc does not manage other files. Just copy them by ourselves
    const fileCopy = await copyExtraFiles(onitConfigFile);
    await new Promise(resolve => {
        fileCopy.start(() => {
            fileCopy.close();
            resolve(null);
        });
    });

    logger.info('[TSC] Tsc build completed!');
}
