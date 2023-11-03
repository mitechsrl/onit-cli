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
import path from 'path';
import _ from 'lodash';
import { GenericObject, NotFoundError, OnitConfigFile, ParseError } from '../types';

// try to load a file. Throw a customized error in case of failure
async function loadJs(filename: string): Promise<GenericObject> {  
    try {
        // we're using plain js files for config. Load them with require.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const loaded = require(filename);

        // required value is a function. Run it.
        if (typeof loaded === 'function'){
            return {
                // this accept both sync and async functions
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await    
                json: await loaded(),
                filename: filename
            };
        }

        // Returned value is a promise. Await it.
        if (loaded instanceof Promise){
            return {
                json: await loaded,
                filename: filename
            };
        }

        // simple object fallback
        return {
            json: loaded,
            filename: filename
        };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        throw new ParseError(
            'Load of '+filename+' failed with error:\nStack:'+error.stack.split('\n').slice(0, 3).join('\n'),
            filename);
    }
}

// try to load a file. Throw a customized error in case of failure
async function loadJson(filename:string): Promise<GenericObject> {
    try {
        return {
            json: JSON.parse(fs.readFileSync(filename).toString()),
            filename: filename
        };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        throw new ParseError(error.message, filename);
    }
}

/**
 * Base load function. Search for specific named files in a specified directory and load them
 *
 * @param {*} context directory where to search for files
 * @param {*} customFileName Override the default filename of 'onit[type].config'
 *
 * @returns Promise, which resolve to Object, {filename:string, json: object, fileNameWithoutExt: string }
 *
 */
async function loadBase(context:string, manualConfigFile?:string): Promise<OnitConfigFile> {
    let fileNameWithoutExt = 'onit.config'; // default config filename
    if (manualConfigFile) {
        // remove extension (only js or json)
        fileNameWithoutExt = manualConfigFile.replace(/\.js(on)?$/, '');
    }

    let json = null;
    let filename = null;
    const jsfile = path.join(context, fileNameWithoutExt + '.js');
    const jsonfile = path.join(context, fileNameWithoutExt + '.json');

    // try to load js file if it exists
    if (fs.existsSync(jsfile)) {
        const tmp = await loadJs(jsfile);
        json = tmp.json;
        filename = tmp.filename;

        // try to load json files if exists
    } else if (fs.existsSync(jsonfile)) {
        const tmp = await loadJson(jsonfile);
        json = tmp.json;
        filename = tmp.filename;

        // no files to be loaded. We are not going to do anything without a config.
    } else {
        throw new NotFoundError('File ' + fileNameWithoutExt + '.[js,json] not found in ' + context);
    }

    return {
        json: json,
        sources: [filename],
        fileNameWithoutExt: fileNameWithoutExt
    };
}

/**
 * Load the local config file. Throws an error only if the file syntax is wrong.
 * The local fie is optional, so this does nothing when the file does not exists.
 *
 * @param {*} context directory where to search for files
 * @param {*} file the previous, non-local loaded file
 * @returns
 */
async function loadLocal(context:string, file:OnitConfigFile): Promise<OnitConfigFile> {

    let localFile = null;
    try{
        localFile = await loadBase(context, file.fileNameWithoutExt + '.local');
    }catch(e){
        if (e instanceof NotFoundError) return file;
        throw e;
    }

    // keep track this file for the sources.
    file.sources.push(localFile.sources[0]);

    // Merge the two jsons. Array are concatenated.
    file.json = _.mergeWith(file.json, localFile.json, (objValue, srcValue) => {
        // in case of arrays merge them by concat
        if (Array.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    });

    // Link are processed to remove duplicates.
    // Same links are merged in a unique final object
    if (file.json.link) {
        const tmp = file.json.link.reduce((acc, l) => {
            acc[l.link] = _.merge(acc[l.link], l);
            return acc;
        }, {} as GenericObject);
        file.json.link = Object.values(tmp);
    }

    return file;
        
}

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
export async function onitFileLoader(context = process.cwd(), manualConfigFile?:string) {
    let file = await loadBase(context, manualConfigFile);
    file = await loadLocal(context, file);
    return file;
}
