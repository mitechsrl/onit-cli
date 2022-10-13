/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

import { spawn as _spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { logger } from './logger';

export type SpawnResult = {
    exitCode: number,
    output: string
};

/**
 * Process spawn helper
 * @param {string} cmd Command to run
 * @param {string[]} params array of parameters
 * @param {boolean} print print command output to console. Default to true.
 * @param {SpawnOptionsWithoutStdio} options SpawnOptionsWithoutStdio object. See node child_process docs
 * @returns
 */
export async function spawn(cmd: string, params: string[], print?: boolean, options?: SpawnOptionsWithoutStdio ): Promise<SpawnResult> {
    return new Promise((resolve, reject) => {
        const proc = _spawn(cmd, params, options);

        let _data = Buffer.from('');
        proc.stdout.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (print !== false) { 
                logger.rawLog(data.toString());
            }
        });

        proc.stderr.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (print !== false) { 
                logger.rawLog(data.toString()); 
            }
        });

        proc.on('close', (code: number) => {
            return resolve({
                exitCode: code, 
                output: _data.toString()
            });
        });

        proc.on('error', (err) => {
            return reject(err);
        });
    });
}

