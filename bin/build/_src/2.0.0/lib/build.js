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
const webpack = require('./webpack');
const clean = require('./clean');
const fs = require('fs');
const logger = require('../../../../../lib/logger');
const tsc = require('./tsc');

module.exports.build = async function (cwdPackageJson, buildTarget, onitConfigFile) {
    const buildMode = buildTarget.mode || 'production';

    let defaultIgnoreFile = path.join(__dirname, '../configFiles/.defaultignore.' + buildMode);
    if (!fs.existsSync(defaultIgnoreFile)) {
        defaultIgnoreFile = path.join(__dirname, '../configFiles/.defaultignore');
    }

    // clean the build directory
    await clean(onitConfigFile, buildMode, cwdPackageJson);

    // launch webpack build
    await webpack('./dist-fe', onitConfigFile, buildMode);

    // launch typescript build
    await tsc(onitConfigFile, cwdPackageJson);

    logger.info('Build completato.');

    return {
    };
};
