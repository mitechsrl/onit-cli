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
import { GenericObject, OnitConfigFile, OnitConfigFileServeOnFirstTscCompilationSuccess, StringError } from '../../../../../types';
import { spawnNodeProcess, SpawnNodeProcessResult } from './spawnNodeProcess';
import { spawnSubprocess, SpawnSubprocessResult } from './spawnSubprocess';
import readline from 'readline';
import _ from 'lodash';
import { copyExtraFiles } from '../../../../build/_versions/2.0.0/lib/copyExtraFiles';
import TscWatchClient from 'tsc-watch/client';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import os from 'os';

const subProcesses: SpawnSubprocessResult[]= [];

export async function tscWatchAndRun(onitConfigFile: OnitConfigFile, cwdPackageJson: GenericObject, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void>{
    
    const tsConfigFile = ['./tsconfig.json','./tsconfig.js'].map(f => {
        return join(dirname(onitConfigFile.sources[0]),f);
    }).find(fn => {
        return existsSync(fn);
    });
    
    if (!tsConfigFile) throw new StringError('No tsconfig file found in project directory');

    const exitAfterTsc = argv.exit;
    const launchNode = !argv.watch;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
        const fileCopy = await copyExtraFiles(onitConfigFile);

        const rl = readline.createInterface({
            input: process.stdin
        });

        let nodeProcess: SpawnNodeProcessResult|null = null;
        const watch = new TscWatchClient();

        let nodeProcessLaunchTimeout: NodeJS.Timeout | null = null;
        const debouncedLaunchNodeProcess = (timeout: number) => {
            if (nodeProcessLaunchTimeout) clearTimeout(nodeProcessLaunchTimeout);
            nodeProcessLaunchTimeout = setTimeout(() => {
                nodeProcessLaunchTimeout = null;
                nodeProcess = spawnNodeProcess(onitConfigFile, onitConfigFile.json.serve ?? {}, cwdPackageJson, argv);
            },timeout);
        };   

        const launchOrReload = () => {
            if (!launchNode) return;
            if (nodeProcess) {
                // we have an already running node porcess. kill it and respawn
                console.log('Reloading node app...');
                nodeProcess.kill(() => {
                    nodeProcess = null;
                    debouncedLaunchNodeProcess(1000);
                });
            } else {
                // no node processes already running. Spawn a new one
                debouncedLaunchNodeProcess(1000);
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

            // Fake a shutdown signal. On win, a message is sent (Using process IPC), on linux, SIGINT is used
            // NOTE: on win, the same method as of pm2 shutdown-with-message is used (https://pm2.keymetrics.io/docs/usage/signals-clean-restart/)
            if (line.trim() === 'shutdown') {
                if (os.platform() === 'win32'){
                    nodeProcess?.getProcess()?.send('shutdown');
                }else{
                    nodeProcess?.getProcess()?.kill('SIGINT');
                }
            }
        });

        watch.on('first_success', () => {
            logger.info('First compilation success.');

            // run this callback after the first file copy is successful
            const onFilesCopied = () => {
                logger.info('Files scan & copy completed');

                if (exitAfterTsc) {
                    resolve();
                    return;
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
                resolve();
                return;
            }
        });

        // start the watcher. adding --noClear because it's annoying that tsc clear the console
        // when there's stuff from other processes (webpack mainly)!
        watch.start('--noClear','-p', tsConfigFile);

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
                if (nodeProcessLaunchTimeout) clearTimeout(nodeProcessLaunchTimeout);
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
