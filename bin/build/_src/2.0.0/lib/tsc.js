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

const copyExtraFiles = require('../../../../../shared/2.0.0/lib/copyExtraFiles');
const spawn = require('../../../../../lib/spawn');
const logger = require('../../../../../lib/logger');

module.exports = async function (onitConfigFile, cwdPackageJson) {
    logger.log('[TSC] Starting tsc build...');

    // run the user build script if any, otherwise just run the loopback tsc compiler (which btw is
    // the default implementation of 'npm run build' for loopback 4 projects)
    if (typeof (cwdPackageJson.scripts || {}).build === 'string') {
        await spawn('npm', ['run', 'build'], true, { shell: true });
    } else {
        await spawn('npx', ['lb-tsc'], true, { shell: true });
    }

    // tsc does not manage other files. Just copy them by ourselves
    const fileCopy = copyExtraFiles(onitConfigFile);
    await new Promise(resolve => {
        fileCopy.start(() => {
            fileCopy.close();
            resolve();
        });
    });

    logger.log('[TSC] Tsc build finished');
};
