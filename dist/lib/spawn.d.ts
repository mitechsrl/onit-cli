/// <reference types="node" />
import { SpawnOptionsWithoutStdio } from 'child_process';
export declare type SpawnResult = {
    exitCode: number;
    output: string;
};
/**
 * Process spawn helper. Proxy method to child_process.spawn to promisifize it and apply some custom logic
 *
 * @param cmd Command to be run
 * @param params Array of strings for parameters
 * @param print print command output to console. Default to true.
 * @param options SpawnOptionsWithoutStdio object. See node child_process docs
 * @returns SpawnResult object {exitCode:number, output:stirng}
 */
export declare function spawn(cmd: string, params?: string[], print?: boolean, options?: SpawnOptionsWithoutStdio): Promise<SpawnResult>;
