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
const logger = require('./logger');

/**
 * Base load function. Search for specific named files in a specified directory and load them
 *
 * @param {*} context directory where to search for files
 * @param {*} customFileName Override the default filename of 'onit[type].config'
 *
 * @returns Promise, which resolve to Object, {filename:string, json: object, fileNameWithoutExt: string }
 *
 */
const loadBase = (context, customFileName) => {
    if (customFileName) {
        if (customFileName.endsWith('.js')) {
            customFileName = customFileName.substr(0, customFileName.length - 3);
        } else if (customFileName.endsWith('.json')) {
            customFileName = customFileName.substr(0, customFileName.length - 5);
        }
    }

    const fileNameWithoutExt = customFileName || 'onit.config';

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
        sources: [filename],
        fileNameWithoutExt: fileNameWithoutExt
    });
};

/**
 * Load the local config file. Throws an error only if the file syntax is wrong.
 * Does nothing when the file does not exists since it is options.
 *
 * @param {*} context directory where to search for files
 * @param {*} file the previous, non-local loaded file
 * @returns
 */
const loadLocal = (context, file) => {
    return loadBase(context, file.fileNameWithoutExt + '.local')
        .then(localFile => {
            file.sources.push(localFile.sources[0]);
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
 * Legacy loader for onitserve.config.[js|json] && onitbuild.config.[js|json] files.
 * This loader merge these two files into a valid new format one.
 *
 * @param {*} context directory where to search for files
 * @returns
 */
const loadLegacyFiles = (context) => {
    let serve = null;
    return loadBase(context, 'onitserve.config')
        .then(_serve => {
            return loadLocal(context, _serve);
        })
        .then(_serve => {
            serve = _serve;
            return loadBase(context, 'onitbuild.config');
        })
        .then(_build => {
            return loadLocal(context, _build);
        })
        .then(build => {
            logger.warn('WARN: project at ' + context + ' uses deprecated config files. Please rewrite them in the new format');
            const config = {
                json: {
                    component: build.json.component || serve.json.component || false,
                    export: build.json.export,
                    link: serve.json.link || [],
                    serve: serve.json,
                    build: build.json
                },
                sources: [...serve.sources, ...build.sources]
            };
            return config;
        })
        .catch(e => {
            // parse error is way more serious. It means something is wring with the config file. Throw always an error
            if (e.parse) {
                throw new Error('Parse file ' + e.filename + ' fallito. Verifica sintassi file. \n' + e.stack);
            }

            throw e;
        });
};

/**
 * Search for various config giles format. In detail
 * - search for (and use if found) onit.config.[js|json] (and optionally, if available onit.config.local.[js|json])
 * - if not found, search for legacy onitserve.config.[js|json] and onitbuild.config.[js|json] (and their local versions)
 *
 * NOTE: the local versions are files with the same structure of the non.local version, it's just designed to not be commited
 * so users can add their own parameters ( probably local paths to the user system or any other temporary config)
 *
 * Throws if nothing can be found
 * @param {*} context
 * @param {*} customFileName Filename to be loaded
 */
module.exports.load = function (context = process.cwd(), customFileName) {
    return loadBase(context, customFileName)
        .then(file => {
            return loadLocal(context, file);
        })
        .catch(e => {
            // parse error is way more serious. It means something is wring with the config file. Throw always an error
            if (e.parse) {
                throw new Error('Parse file ' + e.filename + ' fallito. Verifica sintassi file. \n' + e.stack);
            }

            if (e.notFound) return loadLegacyFiles(context);
            throw e;
        });
};
