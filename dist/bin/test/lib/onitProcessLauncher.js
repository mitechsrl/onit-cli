"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onitProcessLauncher = void 0;
const types_1 = require("../../../types");
const spawnNodeProcess_1 = require("../../serve/versions/2.0.0/lib/spawnNodeProcess");
const path_1 = require("path");
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
async function onitProcessLauncher(onitConfigFile, testTarget) {
    // find the main onit js file
    const mainFile = (0, spawnNodeProcess_1.getMainExecutableFilePath)(onitConfigFile, testTarget);
    if (!mainFile) {
        throw new types_1.StringError('Cannot detect onit entry point file.');
    }
    // Require onit and launch it
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const onit = require((0, path_1.join)(process.cwd(), mainFile));
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
exports.onitProcessLauncher = onitProcessLauncher;
//# sourceMappingURL=onitProcessLauncher.js.map