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
// const path = require('path');

function spawnNodeProcess (params = [], options = {}) {
    let proc = spawn('node', ['./dist/index.js', ...params], Object.assign(options, { stdio: 'inherit' }));
    let killing = false;
    let exitCb = null;
    proc.on('exit', (code) => {
        if (!killing) {
            logger.error('Process exited with code ' + code);
        } else {
            if (typeof exitCb === 'function') {
                exitCb();
            }
        }
        proc = null;
    });

    return {
        kill: (cb) => {
            if (proc) {
                exitCb = cb;
                killing = true;
                proc.kill();
            } else {
                // process probably crashed before. Just call the cb
                cb();
            }
        }
    };
}
module.exports.start = async (logger, onitConfigFile, debug, reload, timeout) => {
    return new Promise(resolve => {
        let nodeProcess = null;
        const watch = new TscWatchClient();

        watch.on('started', () => {
            console.log('Compilation started');
        });

        watch.on('first_success', () => {
            logger.info('First compilation success.');
        });

        watch.on('success', () => {
            if (nodeProcess) {
                // we have an already running node porcess. kill it and respawn
                console.log('Reloading node app...');
                nodeProcess.kill(() => {
                    nodeProcess = spawnNodeProcess();
                });
            } else {
                // no node processes already running . Spawn a new one
                nodeProcess = spawnNodeProcess();
            }
        });

        watch.on('compile_errors', () => {
            // Your code goes here...
        });

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
        /**
         * Catch SIGINT (ctrl+c from console) so we stop nodemon when the user ask for it
         */
        process.on('SIGINT', () => {
            logger.warn('Stop/reset tsc...');
            watch.kill();
            if (nodeProcess) {
                logger.warn('Killing node process...');
                nodeProcess.kill();
            }

            resolve();
        });
    });
};
