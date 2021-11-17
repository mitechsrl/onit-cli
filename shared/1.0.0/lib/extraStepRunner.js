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

const logger = require('../../../lib/logger');
const spawn = require('../../../lib/spawn');
const replace = require('./replace').replace;

module.exports = (step, vars) => {
    logger.log('Eseguo step <' + step.name + '>...');
    step = replace(step, vars);
    let originalCwd = null;
    if (step.cwd) {
        originalCwd = process.cwd();
        process.chdir(step.cwd);
    }

    return Promise.resolve()
        .then(() => {
            // handler for cmd-type step
            if (step.cmd) {
                const cmd = Array.isArray(step.cmd) ? step.cmd[0] : step.cmd;
                const params = (Array.isArray(step.cmd) && (step.cmd.length > 1)) ? [step.cmd[1]] : [];

                return spawn(cmd, params, true, {
                    // This allows to run command on windows without adding '.cmd' or '.bat'. See
                    // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
                    shell: true,

                    // NOTE: this is inherithed from the current process(which already did the cwd!)
                    cwd: process.cwd()
                });
            }
            return false;
        }).then(() => {
            if (originalCwd) {
                process.chdir(originalCwd);
            }

            logger.log('Step <' + step.name + '> completo!');
            return 0;
        });
};
