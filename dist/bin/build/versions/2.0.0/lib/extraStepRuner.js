"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extraStepRunner = void 0;
const logger_1 = require("../../../../../lib/logger");
const spawn_1 = require("../../../../../lib/spawn");
const replace_1 = require("./replace");
async function extraStepRunner(step, vars) {
    logger_1.logger.log('Running <' + step.name + '>...');
    step = (0, replace_1.replace)(step, vars);
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
            logger_1.logger.log('Running <' + cmd + '>');
            const result = await (0, spawn_1.spawn)(cmd, [], true, {
                // This allows to run command on windows without adding '.cmd' or '.bat'. See
                // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
                shell: true,
                // NOTE: this is inherithed from the current process(which already did the cwd!)
                cwd: process.cwd()
            });
            if (result.exitCode !== 0) {
                throw new Error('Command failed. Exit code: ' + result.exitCode);
            }
        }
    }
    if (originalCwd) {
        process.chdir(originalCwd);
    }
    logger_1.logger.log('Step <' + step.name + '> completed!');
    return 0;
}
exports.extraStepRunner = extraStepRunner;
//# sourceMappingURL=extraStepRuner.js.map