"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackWatcher = void 0;
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const logger_1 = require("../../../../../lib/logger");
/**
 *
 * @param webpackConfig
 * @param argv
 * @returns
 */
async function webpackWatcher(webpackConfig, argv) {
    const exitAfterCompile = argv.exit;
    return new Promise(_resolve => {
        let resolve = () => {
            // overwrite the resolve method to prevent bveing called again;
            resolve = () => null;
            _resolve();
        };
        // watcher callback
        const componentName = path_1.default.basename(webpackConfig.context);
        let booting = true;
        let hadErrorBoot = false;
        let startsWatch = null;
        let watcher = null;
        // callback for build completed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const watcherCallback = (err, stats) => {
            // Errors on boot requires reboot because some files are not generated on sequentials partial builds.
            // This is probably caused by some misconfiguration, but now can't find where it is.
            if (hadErrorBoot) {
                hadErrorBoot = false;
                watcher === null || watcher === void 0 ? void 0 : watcher.close(() => {
                    booting = true;
                    if (startsWatch) {
                        watcher = startsWatch();
                    }
                });
                return;
            }
            // do we had internal errors?
            if (err) {
                if (booting)
                    hadErrorBoot = true;
                return;
            }
            // do we had compile errors?
            if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
                if (booting)
                    hadErrorBoot = true;
                return;
            }
            booting = false;
            logger_1.logger.info('[WEBPACK] ' + componentName + ' - Compile completed');
            if (exitAfterCompile) {
                // eslint-disable-next-line no-process-exit
                // process.exit(0);
                watcher === null || watcher === void 0 ? void 0 : watcher.close(() => { return; });
                return resolve();
            }
        };
        startsWatch = function () {
            hadErrorBoot = false;
            booting = true;
            // create a compiler based on the config
            return (0, webpack_1.default)(webpackConfig).watch({
                aggregateTimeout: 700,
                ignored: ['files/**/*.js', 'node_modules/**']
            }, watcherCallback);
        };
        // start the watcher!
        watcher = startsWatch();
        // catch the SIGINT and then stop the watcher
        process.on('SIGINT', () => {
            resolve();
        });
    });
}
exports.webpackWatcher = webpackWatcher;
//# sourceMappingURL=webpackWatcher.js.map