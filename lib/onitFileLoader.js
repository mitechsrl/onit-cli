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

const fs = require('fs');
const path = require('path');

/**
 *
 * @param {*} fileType
 * @param {*} context
 * @param {*} silent
 */
module.exports.load = (fileType, context = process.cwd(), customFileName) => {
    if (customFileName) {
        if (customFileName.endsWith('.js')) {
            customFileName = customFileName.substr(0, customFileName.length - 3);
        } else if (customFileName.endsWith('.json')) {
            customFileName = customFileName.substr(0, customFileName.length - 5);
        }
    }

    let fileNameWithoutExt = null;
    if (fileType === 'serve') {
        fileNameWithoutExt = customFileName || 'onitserve.config';
    } else if (fileType === 'build') {
        fileNameWithoutExt = 'onitbuild.config';
    } else {
        throw new Error('unknown fileType ' + fileType);
    }

    let error = null;
    let json = null;
    let filename = null;
    const jsfile = path.join(context, fileNameWithoutExt + '.js');
    const jsonfile = path.join(context, fileNameWithoutExt + '.json');

    if (fs.existsSync(jsfile)) {
        json = require(jsfile);
        filename = jsfile;
    } else if (fs.existsSync(jsonfile)) {
        try {
            json = JSON.parse(fs.readFileSync(jsonfile).toString());
            filename = jsonfile;
        } catch (e) {
            error = e;
        }
    } else {
        error = new Error('File ' + fileNameWithoutExt + '.[js,json] Non trovato in ' + context);
        error.notFound = true;
    }

    if (error) return Promise.reject(error);

    return Promise.resolve({
        json: json,
        filename: filename
    });
};
