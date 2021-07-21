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

const path = require('path');
const loadIgnore = require('../../../../../lib/loadIgnore');
const copy = require('./lib/copy');
const webpack = require('./lib/webpack');
const clean = require('./lib/clean');
const fs = require('fs');
const makeReadme = require('./lib/makeReadme');

module.exports.build = async function (cwdPackageJson, logger, buildTarget, targetDir, onitConfigFile) {
    const buildMode = buildTarget.mode || 'production';

    let defaultIgnoreFile = path.join(__dirname, '../configFiles/.defaultignore.' + buildMode);
    if (!fs.existsSync(defaultIgnoreFile)) {
        defaultIgnoreFile = path.join(__dirname, '../configFiles/.defaultignore');
    }
    // prepare the ignore file processor. This will be used to match files to be copied into the build path
    const ig = loadIgnore([
        path.join(process.cwd(), './.onitbuildignore'),
        defaultIgnoreFile
    ]);

    // create a copy of the project into the build path
    await copy(logger, targetDir, ig);

    // launch webpack build
    await webpack(logger, buildTarget.key || buildMode, onitConfigFile, buildMode);

    // clean the build directory
    await clean(logger, targetDir, onitConfigFile, buildMode);

    // build a basic readme file
    await makeReadme(cwdPackageJson, targetDir);

    logger.info('Build completato.');
    logger.info('Directory di build: ' + targetDir);

    return {
        targetDir: targetDir
    };
};
