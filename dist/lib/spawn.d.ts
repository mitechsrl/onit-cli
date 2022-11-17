/// <reference types="node" />
import { SpawnOptionsWithoutStdio } from 'child_process';
export type SpawnResult = {
    exitCode: number;
    output: string;
};
/**
 * Process spawn helper
 * @param {string} cmd Command to run
 * @param {string[]} params array of parameters
 * @param {boolean} print print command output to console. Default to true.
 * @param {SpawnOptionsWithoutStdio} options SpawnOptionsWithoutStdio object. See node child_process docs
 * @returns
 */
export declare function spawn(cmd: string, params: string[], print?: boolean, options?: SpawnOptionsWithoutStdio): Promise<SpawnResult>;
