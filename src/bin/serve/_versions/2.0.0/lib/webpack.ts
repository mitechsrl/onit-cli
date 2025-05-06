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

import _ from 'lodash';
import yargs from 'yargs';
import { GenericObject, OnitConfigFile } from '../../../../../types';
import { webpackConfigFactory } from '../configFiles/webpack.config';
import { buildWebpackConfig, webpackMergeFn } from '../../../../build/_versions/2.0.0/lib/buildWebpackConfig';
import { webpackWatcher } from './webpackWatcher';
import { searchEntryPoints } from '../../../../build/_versions/2.0.0/lib/searchEntryPoints';

/**
 * Launch a webpack build & watch. Resolve when the user trigger SIGINT (since this is a cli, 
 * the user acan stop it by pressing ctrl+c)
 * 
 * @param onitConfigFile The config file content
 * @param cwdPackageJson 
 * @param argv yargs arguments
 * @returns 
 */
export async function webpackDevBuildAndWatch (onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject, argv: yargs.ArgumentsCamelCase<unknown>){

    // search all entry points for the current run directory (they are spread over in webpack.json files)
    const customPaths = onitConfigFile.json.reactPaths || onitConfigFile.json.webpackEntryPointPaths;
    const entryPoints = searchEntryPoints(process.cwd(), customPaths);

    // Build the webpack exports for the project at the current dir and node_modules
    const thisProjectWebpackExports = await buildWebpackConfig(process.cwd(), onitConfigFile);

    // create a webpack config for the current path project
    let webpackConfig = await webpackConfigFactory(process.cwd(), {
        entryPoints: entryPoints,
        minimize: argv.minimize,
        production: argv.prod,
        outputPath: _.get(onitConfigFile, 'json.webpack.outputPath', './dist-fe')
    }, cwdPackageJson);

    // merge the base webpack config with exports
    webpackConfig = _.mergeWith(webpackConfig, thisProjectWebpackExports, webpackMergeFn);

    // generate a webpack watcher instance and run it
    return webpackWatcher(webpackConfig, argv);
}
