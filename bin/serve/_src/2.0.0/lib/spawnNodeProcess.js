const { spawn } = require('child_process');
const logger = require('../../../../../lib/logger');
const path = require('path');
const fs = require('fs');

/**
 * Spawn a node process for the app
 *
 * @param {*} onitConfigFile the onit configuration file
 * @param {*} params the params to be added at the command line
 * @param {*} options options for child_process.spawn
 * @returns
 */
function spawnNodeProcess (onitConfigFile, params = [], options = {}) {
    const paramsFromOnitConfigFile = (onitConfigFile.json.serve.nodeArgs || []);

    // Prepare the env variables
    let env = (onitConfigFile.json.serve || {}).environment || {};

    if (!process.argv.find(v => v.toLowerCase() === '-dangerouslyenablesmtpserver')) {
        env.EMAIL_SERVER = null;
        delete env.EMAIL_SERVER;
    };

    env.ONIT_COMPONENTS = [];

    // check whatever we need to launch the app as component
    let mainJsFile = './dist/index.js';
    if (onitConfigFile.json.component) {
        // in case of component, set a different main js file and
        // add in the environment a variable to enable this directory as compoennt
        env.ONIT_COMPONENTS.push(path.resolve(process.cwd(), './'));
        env.ONIT_COMPONENTS_SCANDIRS = ((onitConfigFile.json.serve || {}).componentsScanDirs || []).map(d => path.resolve(process.cwd(), d));

        mainJsFile = (onitConfigFile.json.serve || {}).main;
        if (!mainJsFile) {
            // now is onit-next, this will save us in future when a rename to onit will be done
            mainJsFile = [
                './node_modules/@mitech/onit-next/dist/index.js',
                './node_modules/@mitech/onit/dist/index.js',
                '../node_modules/@mitech/onit-next/dist/index.js',
                '../node_modules/@mitech/onit/dist/index.js'
            ].find(p => {
                return fs.existsSync(p);
            });
        }
    }

    // extra additional components to be loaded
    const componentsPaths = (onitConfigFile.json.serve || {}).componentsPaths || [];
    if (componentsPaths.length > 0) {
        env.ONIT_COMPONENTS.push(...componentsPaths.map(p => path.resolve(process.cwd(), p)));
    }

    // remove duplicates
    env.ONIT_COMPONENTS = env.ONIT_COMPONENTS.filter((item, index) => env.ONIT_COMPONENTS.indexOf(item) === index);

    // env vars must be strings, so check and convert them.
    Object.keys(env).forEach(key => {
        if (typeof env[key] === 'object') { env[key] = JSON.stringify(env[key]); }
    });
    env = Object.assign({ ONIT_RUN_FILE: onitConfigFile.sources[0] }, env);
    // merge the generated env (from serve file) with the standard one from the OS
    // this allow the usage of system-wide vars.
    env = Object.assign({}, process.env, env);

    const finalParams = [...params, ...paramsFromOnitConfigFile, mainJsFile];
    logger.info('Spawn node process: node ' + finalParams.join(' '));

    // finally launch the node process
    let proc = spawn('node', finalParams,
        Object.assign(options, {
            stdio: ['pipe', process.stdout, process.stderr],
            env: env
        })
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

/**
 * Promise version of the spawnNodeProcess.
 * Stay appended until the user send the SIGINT event.
 * @param {*} onitConfigFile
 * @param {*} nodeParams
 * @returns
 */
function spawnNodeProcessPromise (onitConfigFile, nodeParams) {
    return new Promise(resolve => {
        const nodeProcess = spawnNodeProcess(onitConfigFile, nodeParams);

        // Catch SIGINT (ctrl+c from console) so we stop nodemon when the user ask for it
        process.on('SIGINT', async () => {
            logger.warn('Killing node process...');
            nodeProcess.kill(() => { resolve(); });
        });
    });
}
module.exports = {
    spawnNodeProcess: spawnNodeProcess,
    spawnNodeProcessPromise: spawnNodeProcessPromise
};
