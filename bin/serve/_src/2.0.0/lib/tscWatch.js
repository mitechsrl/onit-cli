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
const TscWatchClient = require('tsc-watch/client');
const { spawn } = require('child_process');
const logger = require('../../../../../lib/logger');
const readline = require('readline');
const copyExtraFiles = require('./copyExtraFiles');
const path = require('path');
const _ = require('lodash');
const { spawnNodeProcess } = require('./spawnNodeProcess');
// const path = require('path');

function spawnSubprocess (config) {
    let proc = spawn(
        config.cmd,
        {
            stdio: [null, 'inherit', 'inherit'],
            shell: true,
            cwd: config.cwd
        }
    );

    let killCb = null;
    proc.on('exit', (code) => {
        proc = null;
        if (killCb) killCb();
    });

    return {
        kill: (cb) => {
            if (proc) {
                killCb = cb;
                proc.kill();
            } else {
                cb();
            }
        }
    };
}
const subProcesses = [];

module.exports.start = async (onitConfigFile, exitAfterTsc, launchNode) => {
    return new Promise(resolve => {
        const nodeParams = [];

        const fileCopy = copyExtraFiles(logger, onitConfigFile, path.join(process.cwd(), './dist'));

        const rl = readline.createInterface({
            input: process.stdin
        });

        let nodeProcess = null;
        const watch = new TscWatchClient();

        const launchOrReload = () => {
            if (!launchNode) return;

            if (nodeProcess) {
                // we have an already running node porcess. kill it and respawn
                console.log('Reloading node app...');
                nodeProcess.kill(() => {
                    nodeProcess = spawnNodeProcess(onitConfigFile, nodeParams);
                });
            } else {
                // no node processes already running . Spawn a new one
                nodeProcess = spawnNodeProcess(onitConfigFile, nodeParams);
            }
        };

        // the function to run on compilation success
        // by default it does nothing, this will be valorized after some initial
        // steps
        let onSuccess = () => {};

        rl.on('line', (line) => {
            // manual app restart
            if (line.trim() === 'rs') {
                logger.log('Launch or reload');
                launchOrReload();
            }
        });

        watch.on('started', () => {
            console.log('Compilation started');
        });

        watch.on('first_success', () => {
            logger.info('First compilation success.');

            if (exitAfterTsc) {
                // eslint-disable-next-line no-process-exit
                process.exit(0);
            }

            // run this callback after the first file copy is successful
            const onFilesCopied = () => {
                logger.log("Files scan & copy completed");
                const _subProcesses = _.get(onitConfigFile, 'json.serve.onFirstTscCompilationSuccess', []);
                _subProcesses.forEach(sp => {
                    if (sp.cmd) {
                        logger.info('Launch ' + sp.name);
                        subProcesses.push(spawnSubprocess(sp));
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
            onSuccess();
        });

        watch.on('compile_errors', () => {
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
            } else {
                cb();
            }
        };

        // Catch SIGINT (ctrl+c from console) so we stop nodemon when the user ask for it
        process.on('SIGINT', async () => {
            logger.warn('Stop/reset tsc...');
            await fileCopy.close();
            watch.kill();
            killSubProcesses(() => {
                if (nodeProcess) {
                    logger.warn('Killing node process...');
                    nodeProcess.kill(() => { resolve(); });
                } else {
                    resolve();
                }
            });
        });
    });
};
