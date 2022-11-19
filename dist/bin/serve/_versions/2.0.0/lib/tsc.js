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
exports.tscWatchAndRun = void 0;
const logger_1 = require("../../../../../lib/logger");
const spawnNodeProcess_1 = require("./spawnNodeProcess");
const spawnSubprocess_1 = require("./spawnSubprocess");
const readline_1 = __importDefault(require("readline"));
const lodash_1 = __importDefault(require("lodash"));
const copyExtraFiles_1 = require("../../../../build/_versions/2.0.0/lib/copyExtraFiles");
const client_1 = __importDefault(require("tsc-watch/client"));
const subProcesses = [];
async function tscWatchAndRun(onitConfigFile, argv) {
    const exitAfterTsc = argv.exit;
    const launchNode = !argv.watch;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        const fileCopy = await (0, copyExtraFiles_1.copyExtraFiles)(onitConfigFile);
        const rl = readline_1.default.createInterface({
            input: process.stdin
        });
        let nodeProcess = null;
        const watch = new client_1.default();
        const launchOrReload = () => {
            var _a;
            if (!launchNode)
                return;
            if (nodeProcess) {
                // we have an already running node porcess. kill it and respawn
                console.log('Reloading node app...');
                nodeProcess.kill(() => {
                    var _a;
                    nodeProcess = (0, spawnNodeProcess_1.spawnNodeProcess)(onitConfigFile, (_a = onitConfigFile.json.serve) !== null && _a !== void 0 ? _a : {}, argv);
                });
            }
            else {
                // no node processes already running . Spawn a new one
                nodeProcess = (0, spawnNodeProcess_1.spawnNodeProcess)(onitConfigFile, (_a = onitConfigFile.json.serve) !== null && _a !== void 0 ? _a : {}, argv);
            }
        };
        // the function to run on compilation success.
        // by default it does nothing, this will be valorized after some initial steps
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let onSuccess = () => { };
        rl.on('line', (line) => {
            // manual app restart
            if (line.trim() === 'rs') {
                logger_1.logger.log('Launch or reload');
                launchOrReload();
            }
        });
        /*watch.on('started', () => {
            console.log('Compilation started');
        });
*/
        watch.on('first_success', () => {
            logger_1.logger.info('First compilation success.');
            // run this callback after the first file copy is successful
            const onFilesCopied = () => {
                logger_1.logger.info('Files scan & copy completed');
                if (exitAfterTsc) {
                    // eslint-disable-next-line no-process-exit
                    process.exit(0);
                }
                const _subProcesses = lodash_1.default.get(onitConfigFile, 'json.serve.onFirstTscCompilationSuccess', []);
                _subProcesses.forEach(sp => {
                    if (sp.cmd) {
                        logger_1.logger.info('Launch ' + sp.name);
                        subProcesses.push((0, spawnSubprocess_1.spawnSubprocess)(sp));
                    }
                });
                // set the onSuccess function to a function
                // which effectively do something
                onSuccess = () => {
                    launchOrReload();
                };
                process.nextTick(launchOrReload);
            };
            fileCopy.start(onFilesCopied);
        });
        watch.on('success', () => {
            if (!exitAfterTsc) {
                onSuccess();
            }
        });
        watch.on('compile_errors', () => {
            logger_1.logger.log('Compilation errors');
            if (exitAfterTsc) {
                // eslint-disable-next-line no-process-exit
                process.exit(-1);
            }
        });
        // start the watcher. adding --noClear because it's annoying that tsc clear the console
        // when there's stuff from other processes (webpack mainly)!
        watch.start('--noClear');
        // kill all the eventually launched subprocesses
        const killSubProcesses = (cb) => {
            if (subProcesses.length > 0) {
                const sp = subProcesses.shift();
                sp.kill(() => {
                    killSubProcesses(cb);
                });
            }
            else {
                cb();
            }
        };
        // Catch SIGINT (ctrl+c from console) so we stop nodemon when the user ask for it
        process.on('SIGINT', async () => {
            logger_1.logger.warn('Stop/reset tsc...');
            //await fileCopy.close();
            //watch.kill();
            killSubProcesses(() => {
                if (nodeProcess) {
                    logger_1.logger.warn('Killing node process...');
                    nodeProcess.kill(() => { resolve(); });
                }
                else {
                    resolve();
                }
            });
        });
    });
}
exports.tscWatchAndRun = tscWatchAndRun;
//# sourceMappingURL=tsc.js.map