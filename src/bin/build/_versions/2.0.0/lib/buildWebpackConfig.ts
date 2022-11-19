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

import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import { NotFoundError, OnitConfigFile } from '../../../../../types';
import { onitFileLoader } from '../../../../../lib/onitFileLoader';

/**
 * Merge function for webpack config. NOTE: this function will be called by lodash mergeWith.
 * The only extra stuff this fn does is to concat arrays, other stuff is managed automatically by _.merge.
 * @param {*} dst
 * @param {*} src
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function webpackMergeFn(dst: any, src: any){
    if (Array.isArray(dst)) return dst.concat(src);
    return undefined;
}

/**
 * Create teh webpack exports config by merging all the exports from our node_modules dependencies
 *
 * @param {*} context
 * @param {*} onitConfigFile
 * @returns
 */

export async function buildWebpackConfig(context: string, onitConfigFile: OnitConfigFile) {
    const moduleName = path.basename(context);

    // get this module webpack config
    let config = _.get(onitConfigFile, 'json.export.webpack', {});

    const scope = '@mitech';

    // merge it with all the configs from node modules paths
    const nodeModulesPath = path.resolve(context, './node_modules/' + scope);
    let files:string[] = [];
    if (fs.existsSync(nodeModulesPath)) {
        files = await fs.promises.readdir(nodeModulesPath);
    }
    for (const file of files) {
        const dependencyModulePath = path.join(nodeModulesPath, file);
        let moduleConfig: OnitConfigFile;
        try {
            moduleConfig = await onitFileLoader(dependencyModulePath);
            console.log('[WEBPACK] ' + moduleName + ' - trovata dipendenza ' + scope + '/' + file + ' in ' + dependencyModulePath);
            const thisModuleConfig = _.get(moduleConfig, 'json.export.webpack', {});
            config = _.mergeWith(config, thisModuleConfig, webpackMergeFn);
        } catch (error) {
            // if the module don't have a onitBuild file, just skip
            if (!(error instanceof NotFoundError)){
                throw error;
            }
        }
    }

    return config;
}
