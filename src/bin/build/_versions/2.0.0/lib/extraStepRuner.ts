/*
Copyright (c) 2021 Mitech S.R.L.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

import { logger } from '../../../../../lib/logger';
import { spawn } from '../../../../../lib/spawn';
import { GenericObject, OnitConfigFileBuildExtraStep } from '../../../../../types';
import { replace } from './replace';

export async function extraStepRunner(step: OnitConfigFileBuildExtraStep, vars: GenericObject){
    logger.log('Running <' + step.name + '>...');
    step = replace(step, vars);

    // change cwd if needed
    let originalCwd = null;
    if (step.cwd) {
        originalCwd = process.cwd();
        process.chdir(step.cwd);
    }

    if (step.cmd) {
        if (!Array.isArray(step.cmd)) {
            step.cmd = [step.cmd];
        }
        // const cmd = Array.isArray(step.cmd) ? step.cmd[0] : step.cmd;
        // const params = (Array.isArray(step.cmd) && (step.cmd.length > 1)) ? [step.cmd[1]] : [];
        for (const cmd of step.cmd) {
            logger.log('Running <' + cmd + '>');
            const result = await spawn(cmd, [], {
                // This allows to run command on windows without adding '.cmd' or '.bat'. See
                // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
                shell: true,
                // NOTE: this is inherithed from the current process(which already did the cwd!)
                cwd: process.cwd(),
                // Inherith stdio from the current process, we don't need to process the output
                stdio: ['ignore','inherit','inherit']
            });

            if (result.exitCode !== 0) {
                throw new Error('Command failed. Exit code: ' + result.exitCode);
            }
        }
    }

    if (originalCwd) {
        process.chdir(originalCwd);
    }

    logger.log(':white_check_mark: Step <' + step.name + '> completed!');
    return 0;
}