import path from 'path';
import fs from 'fs';
import { GenericObject, OnitConfigFile, OnitConfigFileServe, StringError } from '../../../../../types';
import { logger } from '../../../../../lib/logger';
import yargs from 'yargs';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

/**
 *
 * @param {*} onitConfigFile
 * @param {*} serveConfig
 * @returns
 */
export function buildEnvironment (onitConfigFile: OnitConfigFile, serveConfig: OnitConfigFileServe, argv: yargs.ArgumentsCamelCase<unknown>) {
    // Prepare the env variables
    let env = serveConfig.environment || {};

    if (!argv['dangerouslyenablesmtpserver']) {
        env.EMAIL_SERVER = null;
        delete env.EMAIL_SERVER;
    }

    env.ONIT_COMPONENTS = [];

    // components have some specific env variables
    if (onitConfigFile.json.component) {
        // in case of component, set a different main js file and
        // add in the environment a variable to enable this directory as compoennt
        env.ONIT_COMPONENTS.push(path.resolve(process.cwd(), './'));
        env.ONIT_COMPONENTS_SCANDIRS = (serveConfig.componentsScanDirs || [])
            .map(d => path.resolve(process.cwd(), d));
    }

    // extra additional components to be loaded
    const componentsPaths = serveConfig.componentsPaths || [];
    if (componentsPaths.length > 0) {
        env.ONIT_COMPONENTS.push(...componentsPaths.map(p => path.resolve(process.cwd(), p)));
    }

    // remove duplicates
    env.ONIT_COMPONENTS = env.ONIT_COMPONENTS
        .filter((item:string, index:number) => env.ONIT_COMPONENTS.indexOf(item) === index);

    // env vars must be strings, so check and convert them.
    Object.keys(env).forEach(key => {
        if (typeof env[key] === 'object') { env[key] = JSON.stringify(env[key]); }
    });
    env = Object.assign({ ONIT_RUN_FILE: onitConfigFile.sources[0] }, env);
    // merge the generated env (from serve file) with the standard one from the OS
    // this allow the usage of system-wide vars.
    env = Object.assign({}, process.env, env);

    return env;
}

/**
 * Get the main onit executable filename
 *
 * @param {*} onitConfigFile
 * @param {*} serveConfig
 * @returns
 */
export function getMainExecutableFilePath (onitConfigFile: OnitConfigFile, serveConfig:OnitConfigFileServe) {
// check whatever we need to launch the app as component
    let mainJsFile: string | undefined = './dist/index.js';
    if (onitConfigFile.json.component) {
        if (serveConfig.main){
            mainJsFile = serveConfig.main;
        }else{
        // now is onit-next, this will save us in future when a rename to onit will be done
            mainJsFile = [
                './node_modules/@mitech/onit-next/dist/index.js',
                '../node_modules/@mitech/onit-next/dist/index.js'
            ].find(p => {
                return fs.existsSync(p);
            });
        }
    }

    return mainJsFile;
}

export type SpawnNodeProcessResult = {
    kill: (cb: () => void) => void,
    getProcess: () => ChildProcessWithoutNullStreams | null,
};

/**
 * Spawn a node process for the app
 *
 * @param {*} onitConfigFile the onit configuration file
 * @param {*} params the params to be added at the command line
 * @param {*} options options for child_process.spawn
 * @returns
 */
export function spawnNodeProcess (
    onitConfigFile: OnitConfigFile,
    serveConfig: OnitConfigFileServe,
    cwdPackageJson: GenericObject,
    argv: yargs.ArgumentsCamelCase<unknown>,
    nodeParams: string[] = [],
    spawnOptions: GenericObject = {}
):SpawnNodeProcessResult {
    const paramsFromOnitConfigFile = serveConfig.nodeArgs || [];

    // Prepare the env variables
    const env = buildEnvironment(onitConfigFile, serveConfig, argv);
    // set the name of the run package. This is useful to some dev checks (like the one for dev:true on nexjs)
    env.ONIT_LAUNCH_PACKAGE_NAME = cwdPackageJson.name;

    const mainJsFile = getMainExecutableFilePath(onitConfigFile, serveConfig);
    if (!mainJsFile) {
        throw new StringError('Cannot find main js file');
    }
    const finalParams = [...nodeParams, ...paramsFromOnitConfigFile, mainJsFile];
    logger.info('Spawn node process: node ' + finalParams.join(' '));

    const _spawnOptions: GenericObject = Object.assign(spawnOptions, {
        stdio: ['pipe', process.stdout, process.stderr, 'ipc'],
        env: env
    });

    // finally launch the node process
    let proc: ChildProcessWithoutNullStreams |null = spawn('node', finalParams, _spawnOptions );

    // attach a exit callback.
    let afterKillCb: (()=> void) | boolean = false; // valid only when the user kill the app (basically by reload)
    proc.on('exit', (code) => {
        if (typeof afterKillCb === 'function') {
            afterKillCb();
        } else {
            logger.error('Process exited with code ' + code);
        }
        proc = null;
    });

    return {
        getProcess: ()=> proc,
        kill: (cb: ()=> void) => {
            if (proc) {
                // we have a previous process. Set the proper cb and kill it.
                afterKillCb = cb;
                // this is brutal but we just need it to die as quick as possible
                proc.kill('SIGKILL');
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
export async function spawnNodeProcessPromise (
    onitConfigFile: OnitConfigFile, 
    serveConfig: OnitConfigFileServe, 
    packageJson: GenericObject, 
    argv: yargs.ArgumentsCamelCase<unknown>, 
    nodeParams: string[]): Promise<void> {
    return new Promise(resolve => {
        const nodeProcess = spawnNodeProcess(onitConfigFile, serveConfig, packageJson, argv, nodeParams);

        // Catch SIGINT (ctrl+c from console) so we stop nodemon when the user ask for it
        process.on('SIGINT', async () => {
            logger.warn('Killing node process...');
            nodeProcess.kill(() => { resolve(); });
        });
    });
}

