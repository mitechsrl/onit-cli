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

const nodemon = require('nodemon');
const path = require('path');
const logger = require('../../../../../lib/logger');

module.exports.start = async (onitConfigFile, debug, reload, timeout) => {
    return new Promise(resolve => {
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
                nodemonConfig.nodeArgs.push('--preserve-symlinks');

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

        /**
         * Catch SIGINT (ctrl+c from console) so we stop nodemon when the user ask for it
         */
        process.on('SIGINT', () => {
            logger.warn('Stop/reset nodemon...');
            if (delay) {
                // delay still active, nodemon not already launched. Just stop the timer.
                clearTimeout(delay);
                resolve(0);
            } else {
                nodemon.once('exit', function () {
                    resolve(0);
                }).emit('quit');
            }
        });
    });
};
