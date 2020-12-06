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


const spawn = require('../../../../../../lib/spawn');
const replace = require('./replace').replace;

module.exports = (logger, step, vars) => {
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
