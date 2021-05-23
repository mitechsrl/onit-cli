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
const webpack = require('webpack');

// create a list of promises, each one will launch a webpack watcher managing one single config.
module.exports = (webpackConfigs, logger) => webpackConfigs.map(webpackConfig => {
    return new Promise(resolve => {
        // watcher callback
        const componentName = path.basename(webpackConfig.context);

        let booting = true;
        let hadErrorBoot = false;
        let startsWatch = null;
        let watcher = null;

        // callback for build completed
        const watcherCallback = (err, stats) => {
            // Errors on boot requires reboot because some files are not generated on sequentials partial builds.
            // This is probably caused by some misconfiguration, but now can't find where it is.
            if (hadErrorBoot) {
                hadErrorBoot = false;
                watcher.close(() => {
                    booting = true;
                    watcher = startsWatch();
                });
                return;
            }

            // do we had internal errors?
            if (err) {
                if (booting) hadErrorBoot = true;
                return;
            }

            // do we had compile errors?
            if (stats.hasErrors()) {
                if (booting) hadErrorBoot = true;
                return;
            }

            booting = false;
            logger.info('[WEBPACK] ' + componentName + ' - Compile completed');
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
                logger.warn('[WEBPACK] ' + componentName + ' - Stop webpack watcher...');
                watcher.close(() => {
                    logger.warn('[WEBPACK] ' + componentName + ' - Webpack watch stopped');
                    resolve(0);
                });
            }
        });
    });
});
