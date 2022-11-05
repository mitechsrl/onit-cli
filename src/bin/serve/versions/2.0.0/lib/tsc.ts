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

import yargs from 'yargs';
import { logger } from '../../../../../lib/logger';
import { OnitConfigFile, OnitConfigFileServeOnFirstTscCompilationSuccess } from '../../../../../types';
import { spawnNodeProcess, SpawnNodeProcessResult } from './spawnNodeProcess';
import { spawnSubprocess, SpawnSubprocessResult } from './spawnSubprocess';
import readline from 'readline';
import _ from 'lodash';
import { copyExtraFiles } from '../../../../build/versions/2.0.0/lib/copyExtraFiles';
import TscWatchClient from 'tsc-watch/client';

/*
const TscWatchClient = require('tsc-watch/client');

const logger = require('../../../../../lib/logger');
const copyExtraFiles = require('../../../../../shared/2.0.0/lib/copyExtraFiles');

*/
const subProcesses: SpawnSubprocessResult[]= [];

export async function tscWatchAndRun(onitConfigFile: OnitConfigFile, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>{
    const exitAfterTsc = argv.exit;
    const launchNode = argv.watch;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
        const fileCopy = await copyExtraFiles(onitConfigFile);

        const rl = readline.createInterface({
            input: process.stdin
        });

        let nodeProcess: SpawnNodeProcessResult|null = null;
        const watch = new TscWatchClient();

        const launchOrReload = () => {
            if (!launchNode) return;

            if (nodeProcess) {
                // we have an already running node porcess. kill it and respawn
                console.log('Reloading node app...');
                nodeProcess.kill(() => {
                    nodeProcess = spawnNodeProcess(onitConfigFile, onitConfigFile.json.serve ?? {}, argv);
                });
            } else {
                // no node processes already running . Spawn a new one
                nodeProcess = spawnNodeProcess(onitConfigFile, onitConfigFile.json.serve ?? {}, argv);
            }
        };

        // the function to run on compilation success.
        // by default it does nothing, this will be valorized after some initial steps
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        let onSuccess = () => {};

        rl.on('line', (line: string) => {
            // manual app restart
            if (line.trim() === 'rs') {
                logger.log('Launch or reload');
                launchOrReload();
            }
        });

        /*watch.on('started', () => {
            console.log('Compilation started');
        });
*/
        watch.on('first_success', () => {
            logger.info('First compilation success.');

            // run this callback after the first file copy is successful
            const onFilesCopied = () => {
                logger.info('Files scan & copy completed');

                if (exitAfterTsc) {
                    // eslint-disable-next-line no-process-exit
                    process.exit(0);
                }
                const _subProcesses: OnitConfigFileServeOnFirstTscCompilationSuccess[] = _.get(onitConfigFile, 'json.serve.onFirstTscCompilationSuccess', []);
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
            if (!exitAfterTsc) {
                onSuccess();
            }
        });

        watch.on('compile_errors', () => {
            logger.log('Compilation errors');
            if (exitAfterTsc) {
                // eslint-disable-next-line no-process-exit
                process.exit(-1);
            }
        });

        // start the watcher. adding --noClear because it's annoying that tsc clear the console
        // when there's stuff from other processes (webpack mainly)!
        watch.start('--noClear');

        // kill all the eventually launched subprocesses
        const killSubProcesses = (cb: () => void) => {
            if (subProcesses.length > 0) {
                const sp = subProcesses.shift()!;
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
            //await fileCopy.close();
            //watch.kill();
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
}
