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
// const path = require('path');

/**
 * Spawn a node process for the app
 * @param {*} onitConfigFile the onit configuration file
 * @param {*} params the params to be added at the command line
 * @param {*} options options for child_process.spawn
 * @returns
 */
function spawnNodeProcess (onitConfigFile, params = [], options = {}) {
    // some hardcoded parameters
    const hardcodedParameters = ['--max-old-space-size=4096'];

    // Prepare the env variables
    let env = (onitConfigFile.json.serve || {}).environment || {};
    // env vars must be strings
    Object.keys(env).forEach(key => {
        if (typeof env[key] === 'object') { env[key] = JSON.stringify(env[key]); }
    });
    env = Object.assign({ ONIT_RUN_FILE: onitConfigFile.sources[0] }, env);

    let proc = spawn('node',
        ['./dist/index.js', ...hardcodedParameters, ...params],
        Object.assign(options, { stdio: 'inherit', env: env })
    );

    // attach a exit callback.
    let afterKillCb = false; // valid only when the user kill the app (basically by reload)
    proc.on('exit', (code) => {
        if (typeof afterKillCb === 'function') {
            afterKillCb();
        } else {
            logger.error('Process exited with code ' + code);
        }
        proc = null;
    });

    return {
        kill: (cb) => {
            if (proc) {
                // we have a previous process. Set the proper cb and kill it.
                afterKillCb = cb;
                proc.kill();
            } else {
                // process probably crashed before. Just call the cb
                cb();
            }
        }
    };
}

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

module.exports.start = async (logger, onitConfigFile, launchNode) => {
    return new Promise(resolve => {
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
                    nodeProcess = spawnNodeProcess(onitConfigFile);
                });
            } else {
                // no node processes already running . Spawn a new one
                nodeProcess = spawnNodeProcess(onitConfigFile);
            }
        };

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
            fileCopy.start();

            const _subProcesses = _.get(onitConfigFile, 'json.serve.onFirstTscCompilationSuccess', []);
            _subProcesses.forEach(sp => {
                if (sp.cmd) {
                    logger.info('Launch ' + sp.name);
                    subProcesses.push(spawnSubprocess(sp));
                }
            });
        });

        watch.on('success', () => {
            launchOrReload();
        });

        watch.on('compile_errors', () => {
            // Your code goes here...
        });

        // start the watcher. adding --noClear because it's annoying that tsc clear the console
        // when there's stuff from other processes (webpack mainly)!
        watch.start('--noClear');

        /*
        // add this to a delay so we give some time to other process to start without being too much cpu-heavy
        let delay = setTimeout(() => {
            delay = null;

            // serve: devo calcolare la config di nodemon prima di lanciarlo a partire dal file di config onitserve.config.[js,json]
            const nodemonConfig = require(path.join(__dirname, '../configFiles/nodemon.js'));

            // list of paths to be watched
            const enabledModulesPaths = [];

            nodemonConfig.watch = [process.cwd(), ...(nodemonConfig.watch || [])];

            // if you want to develop a single component and run it you can use the same
            // onitRun file but with a property "component:true".
            // This will make the serve utility to launch the dependency onit loading this component
            if (onitConfigFile.json.component === true) {
                // FIXME: questo diventerà @mitech/onit
                nodemonConfig.script = (onitConfigFile.json.serve || {}).main || './node_modules/@mitech/mitown/server/server.js';
                enabledModulesPaths.push('.');
            }

            if (debug) {
                logger.warn('Modalità debug abilitata');
                // nodemonConfig.exec = 'node';
                nodemonConfig.nodeArgs = nodemonConfig.nodeArgs || [];
                nodemonConfig.nodeArgs.push('--inspect');
                if (!reload) {
                    nodemonConfig.ignore = ['*'];
                }
            }

            // Adding environment stuff (see https://github.com/remy/nodemon/blob/master/doc/sample-nodemon.md)
            const env = (onitConfigFile.json.serve || {}).environment || {};
            Object.keys(env).forEach(key => {
                if (typeof env[key] === 'object') { env[key] = JSON.stringify(env[key]); }
            });
            const _env = Object.assign({ ONIT_RUN_FILE: onitConfigFile.sources[0] }, nodemonConfig.env || {}, env);
            if (Object.keys(_env).length > 0) nodemonConfig.env = _env;

            // inject in the env the list of directories of components to be loaded (additionally to the node_modules ones)
            nodemonConfig.env.ONIT_COMPONENTS = JSON.stringify(enabledModulesPaths.map(p => path.resolve(process.cwd(), p)));

            // Finally launch nodemon
            nodemon(nodemonConfig);

            nodemon.on('quit', function () {
                logger.warn('App terminata');
                resolve(0);
            });
            nodemon.on('log', function (log) {
                console.log(log.colour);
            });

            // nodemon.on('stdout', v => console.log(v));
            // nodemon.on('stderr', v => console.log(v));
        }, timeout);
*/

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
