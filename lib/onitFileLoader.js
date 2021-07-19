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
const _ = require('lodash');

/**
 * Base load function. Search for specific named files in a specified directory and load them
 *
 * @param {*} fileType 'serve' or 'build'
 * @param {*} context Search directory, Defaults to cwd()
 * @param {*} customFileName Override the default filename of 'onit[type].config'
 *
 * @returns Promise, which resolve to Object, {filename:string, json: object, fileNameWithoutExt: string }
 *
 */
const loadBase = (fileType, context, customFileName) => {
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
        fileNameWithoutExt = customFileName || 'onitbuild.config';
    } else if (fileType === 'custom') {
        fileNameWithoutExt = customFileName;
    } else {
        throw new Error('unknown fileType ' + fileType);
    }

    let error = null;
    let json = null;
    let filename = null;
    const jsfile = path.join(context, fileNameWithoutExt + '.js');
    const jsonfile = path.join(context, fileNameWithoutExt + '.json');

    if (fs.existsSync(jsfile)) {
        try {
            json = require(jsfile);
            filename = jsfile;
        } catch (e) {
            error = e;
            error.parse = true;
            error.filename = jsfile;
        }
    } else if (fs.existsSync(jsonfile)) {
        try {
            json = JSON.parse(fs.readFileSync(jsonfile).toString());
            filename = jsonfile;
        } catch (e) {
            error = e;
            error.parse = true;
            error.filename = jsonfile;
        }
    } else {
        error = new Error('File ' + fileNameWithoutExt + '.[js,json] Non trovato in ' + context);
        error.notFound = true;
    }

    if (error) return Promise.reject(error);

    return Promise.resolve({
        json: json,
        filename: filename,
        sources: [filename],
        fileNameWithoutExt: fileNameWithoutExt
    });
};

/**
 * Load the local config file. Throws an error only if the file syntax is wrong.
 * Does nothing when the file does not exists since it is options.
 *
 * @param {*} fileType
 * @param {*} context
 * @param {*} file
 * @returns
 */
const loadLocal = (fileType, context, file) => {
    return loadBase(fileType, context, file.fileNameWithoutExt + '.local')
        .then(localFile => {
            file.sources = [
                file.filename,
                localFile.filename
            ];

            file.json = _.mergeWith(file.json, localFile.json, (objValue, srcValue) => {
                if (_.isArray(objValue)) {
                    return objValue.concat(srcValue);
                }
            });
            return file;
        })
        .catch(e => {
            if (e.parse) {
                throw new Error('Parse file ' + e.filename + ' fallito. Verifica sintassi file. \n' + e.stack);
            }

            return file;
        });
};

/**
 * Load the base config file and merge it to the local config file if needed.
 * The local config file have the same syntax of the config file, but is targeted to have system dependant infos (which cannot be staged under git)
 *
 * @param {*} fileType
 * @param {*} context
 * @param {*} customFileName Filename to be loaded
 */
module.exports.load = function (fileType, context = process.cwd(), customFileName) {
    // load the base onit file
    return loadBase(fileType, context, customFileName)
        .then(file => {
            return loadLocal(fileType, context, file);
        })
        .catch(e => {
            // parse error is way more serious. It means something is wring with the config file. Throw always an error
            if (e.parse) {
                throw new Error('Parse file ' + e.filename + ' fallito. Verifica sintassi file. \n' + e.stack);
            }

            throw e;
        });
};
