const nodemon = require('nodemon');
const path = require('path');

module.exports.start = async (logger, onitServeFile) => {
    return new Promise(resolve => {
        // add this to a delay so we give some time to other process to start without being too much cpu-heavy
        let delay = setTimeout(() => {
            delay = null;

            // serve: devo calcolare la config di nodemon prima di lanciarlo a partire dal file di config onitserve.config.[js,json]
            const nodemonConfig = require(path.join(__dirname, '../configFiles/nodemon.js'));

            // aggiungo watch su moduli caricati così cambiamenti in quelle cartelle rilanciano nodemon!
            const enabledModulesPaths = (onitServeFile.json.loadComponents || [])
                .filter(c => c.enabled) // watch on enabled only
                .filter(c => c.path.indexOf('node_modules') < 0) // don't watch on node_modules dirs
                .map(c => c.path);

            nodemonConfig.watch = [process.cwd(), ...(nodemonConfig.watch || []), ...enabledModulesPaths];

            // if you want to develop a single component and run it you can use the same
            // onitRun file but with a property "component:true".
            // This will make the serve utility to launch the dependency mitown loading this component
            if (onitServeFile.json.component === true) {
                nodemonConfig.script = onitServeFile.json.main || './node_modules/@mitech/mitown/server/server.js';
            }

            // Adding environment stuff (see https://github.com/remy/nodemon/blob/master/doc/sample-nodemon.md)
            const env = onitServeFile.json.environment || {};
            Object.keys(env).forEach(key => {
                if (typeof env[key] === 'object') { env[key] = JSON.stringify(env[key]); }
            });
            const _env = Object.assign({ ONIT_RUN_FILE: onitServeFile.filename }, nodemonConfig.env || {}, env);
            if (Object.keys(_env).length > 0) nodemonConfig.env = _env;

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
        }, 5000);

        /**
         * Catch SIGINT (ctrl+c from console) so we stop nodemon when the user ask for it
         */
        process.on('SIGINT', () => {
            logger.warn('Stop/reset nodemon...');
            if (delay) {
                // delay still active/nodemon not launched. just stop the timer
                clearTimeout(delay);
            } else {
                nodemon.reset();
            }
            resolve(0);
        });
    });
};
