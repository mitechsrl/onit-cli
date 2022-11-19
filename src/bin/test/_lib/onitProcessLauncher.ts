import { OnitConfigFile, OnitConfigFileTestTarget, StringError } from '../../../types';
import { getMainExecutableFilePath } from '../../serve/_versions/2.0.0/lib/spawnNodeProcess';
import { join } from 'path';

/*
const logger = require('../../../lib/logger');
const { runMocha } = require('./lib/runMocha');
const { resolveTestFilesDirectories } = require('./lib/resolveTestFilesDirectories');
const { checkFiles } = require('./lib/checkFiles');
const { requireMochaFromProcessCwd } = require('./lib/requireMochaFromProcessCwd');
const { buildEnvironment, getMainExecutableFilePath } = require('../../../shared/2.0.0/lib/spawnNodeProcess.js');
const path = require('path');
const { printError } = require('../../../lib/printError');
const spawnPromise = require('../../../lib/spawn');
const { npmExecutable, onitExecutable } = require('../../../lib/commandNames');*/
/**
 *
 * @param {*} onitConfigFile
 * @param {*} testTarget
 */
export async function onitProcessLauncher(onitConfigFile: OnitConfigFile, testTarget: OnitConfigFileTestTarget) {
    // find the main onit js file
    const mainFile = getMainExecutableFilePath(onitConfigFile, testTarget);
    if (!mainFile) {
        throw new StringError('Cannot detect onit entry point file.');
    }
    // Require onit and launch it
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const onit = require(join(process.cwd(), mainFile));
    const onitInstance = await onit.launch();

    // wait just some seconds to allow all async stuff to be initialized
    await new Promise(resolve => setTimeout(resolve, 4000));

    return {
        onit: onitInstance,
        // callback to stop onit
        stop: () => {
            return new Promise(resolve => {
                onitInstance.lbApp.onStop(() => {
                    setTimeout(() => {
                        resolve(null);
                    }, 2000);
                });
                onitInstance.stop(false);
            });
        }
    };
}
