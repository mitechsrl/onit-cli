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
import webpack, { Stats } from 'webpack';
import yargs from 'yargs';
import { logger } from '../../../../../lib/logger';
import { GenericObject } from '../../../../../types';

/**
 * 
 * @param webpackConfig 
 * @param argv 
 * @returns 
 */
export async function webpackWatcher(webpackConfig: GenericObject, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>{
    const exitAfterCompile = argv.exit;
    return new Promise(resolve => {
        // watcher callback
        const componentName = path.basename(webpackConfig.context);

        let booting = true;
        let hadErrorBoot = false;
        let startsWatch: (() => webpack.Watching) | null= null;
        let watcher: webpack.Watching | null = null;

        // callback for build completed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const watcherCallback = (err:any, stats: Stats|undefined) => {
            // Errors on boot requires reboot because some files are not generated on sequentials partial builds.
            // This is probably caused by some misconfiguration, but now can't find where it is.
            if (hadErrorBoot) {
                hadErrorBoot = false;
                watcher?.close(() => {
                    booting = true;
                    if (startsWatch){
                        watcher = startsWatch();
                    }
                });
                return;
            }

            // do we had internal errors?
            if (err) {
                if (booting) hadErrorBoot = true;
                return;
            }

            // do we had compile errors?
            if (stats?.hasErrors()) {
                if (booting) hadErrorBoot = true;
                return;
            }

            booting = false;
            logger.info('[WEBPACK] ' + componentName + ' - Compile completed');

            if (exitAfterCompile) {
                // eslint-disable-next-line no-process-exit
                process.exit(0);
            }
        };

        startsWatch = function () {
            hadErrorBoot = false;
            booting = true;
            // create a compiler based on the config
            return webpack(webpackConfig).watch({
                aggregateTimeout: 700,
                ignored: ['files/**/*.js', 'node_modules/**']
            }, watcherCallback);
        };

        // start the watcher!
        watcher = startsWatch();

        // catch the SIGINT and then stop the watcher
        let called = false;
        process.on('SIGINT', () => {
            if (!called) {
                called = true;
                resolve();
            }
        });
    });
}
