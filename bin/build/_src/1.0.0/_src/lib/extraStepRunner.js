
const spawn = require('../../../../../../lib/spawn');
const replace = require('../../../../../../lib/replace').replace;

module.exports = (logger, step, vars) => {
    return new Promise(async (resolve, reject) => {
        logger.log('Eseguo step <' + step.name + '>...');
        step = replace(step, vars);
        let originalCwd = null;
        if (step.cwd) {
            originalCwd = process.cwd();
            process.chdir(step.cwd);
        }

        // handler for cmd-type step
        if (step.cmd) {
            const cmd = Array.isArray(step.cmd) ? step.cmd[0] : step.cmd;
            const params = (Array.isArray(step.cmd) && (step.cmd.length > 1)) ? [step.cmd[1]] : [];

            await spawn(cmd, params, true, {
                // This allows to run command on windows without adding '.cmd' or '.bat'. See
                // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
                shell: true,

                // NOTE: this is inherithed from the current process(which already did the cwd!)
                cwd: process.cwd()
            });
        }

        if (originalCwd) {
            process.chdir(originalCwd);
        }

        logger.log('Step <' + step.name + '> completo!');
        resolve(0);
    });
};
