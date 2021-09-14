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

// try to load a file. Throw a customized error in case of failure
const _loadJs = (filename) => {
    try {
        return {
            json: require(filename),
            filename: filename
        };
    } catch (error) {
        error.parse = true;
        error.reducedStack = error.stack.split('\n').slice(0, 3).join('\n');
        error.filename = filename;
        return { error };
    }
};

// try to load a file. Throw a customized error in case of failure
const _loadJson = (filename) => {
    try {
        return {
            json: JSON.parse(fs.readFileSync(filename).toString()),
            filename: filename
        };
    } catch (error) {
        error.parse = true;
        error.reducedStack = '';
        error.filename = filename;
        return { error };
    }
};

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
    let fileNameWithoutExt = 'onit.config'; // default config filename
    if (customFileName) {
        // remove extension (only js or json)
        fileNameWithoutExt = customFileName.replace(/\.js(on)?$/, '');
    }

    let error = null;
    let json = null;
    let filename = null;
    const jsfile = path.join(context, fileNameWithoutExt + '.js');
    const jsonfile = path.join(context, fileNameWithoutExt + '.json');

    // try to load js file if it exists
    if (fs.existsSync(jsfile)) {
        ({ error, json, filename } = _loadJs(jsfile));

    // try to load json files if exists
    } else if (fs.existsSync(jsonfile)) {
        ({ error, json, filename } = _loadJson(jsonfile));

    // no files to be loaded. We are not going to do anything without a config.
    } else {
        const error = new Error('File ' + fileNameWithoutExt + '.[js,json] not found in ' + context);
        error.notFound = true;
        return Promise.reject(error);
    }

    // errors just interruupt everything
    if (error) {
        const _error = 'Parsing of file ' + path.basename(error.filename) + ' failed.\n' + error.message + '\n' + error.reducedStack;
        return Promise.reject(_error);
    }

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
                // in case of arrays merge them by concat
                if (Array.isArray(objValue)) {
                    return objValue.concat(srcValue);
                }
            });
            return file;
        })
        .catch(e => {
            // parse errors are critical throw it agan.
            if (e.parse) {
                throw new Error('Parsing of ' + e.filename + ' failed. Please check the file syntax.\n' + e.stack);
            }

            // any other error is just ignored. The calculated config is returned.
            return file;
        });
};

/**
 * Legacy loader for onitserve.config.[js|json] && onitbuild.config.[js|json] files.
 * This loader merge these two files into a valid new format.
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
        .catch(error => {
            // serve file may not exist. In that case, just simulate a empty one.
            if (error.notFound) return { json: {} };

            // other kind of errors are rethrown
            else throw error;
        })
        .then(_serve => {
            serve = _serve;
            return loadBase(context, 'onitbuild.config');
        })
        .then(_build => {
            return loadLocal(context, _build);
        })
        .then(build => {
            // merge the two configs into a new unique new one
            // move legacy property to new one.
            build.json.targets = build.json.buildTargets || {};
            Object.keys(build.json.targets).forEach(k => {
                build.json.targets[k].afterSteps = build.json.targets[k].buildExtraSteps;
                delete build.json.targets[k].buildExtraSteps;
            });

            logger.warn('WARN: project at ' + context + ' uses deprecated config files. Please rewrite them in the new format. A onit.config.js.txt was automatically written as example of the new file format.');
            // build a new config based on old values.
            const config = {
                json: {
                    component: build.json.component || serve.json.component || false,
                    export: build.json.export, // serve does not have exports
                    link: [...(serve.json.link || []), ...(build.json.link || [])],
                    serve: serve.json,
                    build: build.json
                },
                autobuildFromLegacy: true, // This is just a flag telling us the config wag generated by merging thr old config files. Mostly for debug purposes.
                sources: [...(serve.sources || []), ...(build.sources || [])]
            };

            // this stuff is redundant (was moved under other name properties)
            delete config.json.serve.link;
            delete config.json.serve.component;
            delete config.json.build.component;
            delete config.json.build.buildTargets;

            // use -g to autocreate the config file
            if (process.argv.find(p => p === '-g')) {
                // autocreate the new file. This is done just to make transition easier
                fs.writeFileSync(path.join(context, 'onit.config.js'), 'module.exports = ' + JSON.stringify(config.json, null, 4));
            }
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

            // Legacy support. In case the new onit.config.[js|json] file canot be found, try with the older format ones
            if (!customFileName && e.notFound) return loadLegacyFiles(context);
            throw e;
        });
};
