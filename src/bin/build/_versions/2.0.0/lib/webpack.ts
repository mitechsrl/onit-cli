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
import { GenericObject, OnitConfigFile } from '../../../../../types';
import { buildWebpackConfig, webpackMergeFn } from './buildWebpackConfig';
import { searchEntryPoints } from './searchEntryPoints';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import webpack from 'webpack';
import { webpackConfigFactory } from '../configFiles/webpack.config';

/**
 * Webpack builder runner
 * 
 * @param distFeTargetDir 
 * @param onitConfigFile The config file content
 * @param buildMode 
 * @param injectBuildOptions 
 * @returns 
 */
export async function runWebpack(distFeTargetDir:string, onitConfigFile:OnitConfigFile, buildMode:string, injectBuildOptions?: GenericObject) {
    logger.info('[WEBPACK] Running a webpack build with config ' + (injectBuildOptions ? JSON.stringify(injectBuildOptions) : 'standard'));

    // const originalPath = process.cwd();
    const context = process.cwd();

    // create a webpack config for the current directory and
    // add dynamic entry points to the webpack config for the current directory.
    // search all entry points for the current run directory (they are spread over in webpack.json files)
    const customPaths = onitConfigFile.json.reactPaths || onitConfigFile.json.webpackEntryPointPaths;
    const entryPoints = searchEntryPoints(context, customPaths);

    // Build the webpack exports for the project at the current dir and node_modules
    const thisProjectWebpackExports = await buildWebpackConfig(context, onitConfigFile);

    // get the package json in the current directory
    const cwdPackageJson: GenericObject = JSON.parse(fs.readFileSync(path.join(context, 'package.json')).toString());

    // create a webpack config for the current path project
    let webpackConfig = await webpackConfigFactory(context, {
        entryPoints: entryPoints,
        buildPath: distFeTargetDir
    }, cwdPackageJson);

    // webpack build is either development or production.
    // everything non-development is translated to roduction (even out 'test' mode)
    webpackConfig.mode = (buildMode === 'production') ? 'production' : 'development';

    // merge the base webpack config with exports
    webpackConfig = _.mergeWith(webpackConfig, thisProjectWebpackExports, webpackMergeFn);

    // add externally-provided options if any
    if (injectBuildOptions) {
        webpackConfig = _.mergeWith(webpackConfig, injectBuildOptions, webpackMergeFn);
    }

    // TODO: aggiungere flag verbose per vedere piu info come questa?
    try {
        // util.promisify break some types?
        const stats: webpack.Stats | undefined = await new Promise((resolve,reject) => {
            webpack(webpackConfig, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });

        // do we had compile errors?
        if (stats) {
            const info = stats.toJson();
            if (stats.hasErrors()) {
                logger.error('[WEBPACK] Compilation error');
                info.errors?.forEach(e => logger.error(e));
                throw new Error('Build aborted');
            }
        }

        console.info('[WEBPACK] Compile completed');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        // do we had internal errors?
        logger.error('[WEBPACK] Compilation error');
        logger.error(err.stack || err);
        if (err.details) logger.error(err.details);
        throw new Error('Build aborted');
    }

    return 0;
}
