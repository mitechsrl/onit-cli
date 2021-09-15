const { spawn } = require('child_process');

function spawnSubprocess (config) {
    let proc = spawn(
        config.cmd,
        {
            stdio: [null, 'inherit', 'inherit'],
            shell: true,
            cwd: config.cwd
        }
    );

    let killCb = null;
    proc.on('exit', (code) => {
        proc = null;
        if (killCb) killCb();
    });

    return {
        kill: (cb) => {
            if (proc) {
                killCb = cb;
                proc.kill();
            } else {
                cb();
            }
        }
    };
}

module.exports.spawnSubprocess = spawnSubprocess;
