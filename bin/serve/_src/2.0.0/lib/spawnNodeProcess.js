const { spawn } = require('child_process');
const logger = require('../../../../../lib/logger');

/**
 * Spawn a node process for the app
 *
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
        [...hardcodedParameters, ...params, './dist/index.js'],
        Object.assign(options, {
            stdio: ['pipe', process.stdout, process.stderr],
            env: Object.assign({}, process.env, env)
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
