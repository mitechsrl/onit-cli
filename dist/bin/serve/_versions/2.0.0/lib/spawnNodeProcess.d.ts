/// <reference types="node" />
import { GenericObject, OnitConfigFile, OnitConfigFileServe } from '../../../../../types';
import yargs from 'yargs';
import { ChildProcessWithoutNullStreams } from 'child_process';
/**
 *
 * @param {*} onitConfigFile
 * @param {*} serveConfig
 * @returns
 */
export declare function buildEnvironment(onitConfigFile: OnitConfigFile, serveConfig: OnitConfigFileServe, argv: yargs.ArgumentsCamelCase<unknown>): GenericObject;
/**
 * Get the main onit executable filename
 *
 * @param {*} onitConfigFile
 * @param {*} serveConfig
 * @returns
 */
export declare function getMainExecutableFilePath(onitConfigFile: OnitConfigFile, serveConfig: OnitConfigFileServe): string | undefined;
export declare type SpawnNodeProcessResult = {
    kill: (cb: () => void) => void;
    getProcess: () => ChildProcessWithoutNullStreams | null;
};
/**
 * Spawn a node process for the app
 *
 * @param {*} onitConfigFile the onit configuration file
 * @param {*} params the params to be added at the command line
 * @param {*} options options for child_process.spawn
 * @returns
 */
export declare function spawnNodeProcess(onitConfigFile: OnitConfigFile, serveConfig: OnitConfigFileServe, cwdPackageJson: GenericObject, argv: yargs.ArgumentsCamelCase<unknown>, nodeParams?: string[], spawnOptions?: GenericObject): SpawnNodeProcessResult;
/**
 * Promise version of the spawnNodeProcess.
 * Stay appended until the user send the SIGINT event.
 * @param {*} onitConfigFile
 * @param {*} nodeParams
 * @returns
 */
export declare function spawnNodeProcessPromise(onitConfigFile: OnitConfigFile, serveConfig: OnitConfigFileServe, packageJson: GenericObject, argv: yargs.ArgumentsCamelCase<unknown>, nodeParams: string[]): Promise<void>;
