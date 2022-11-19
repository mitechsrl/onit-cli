import { spawn, ChildProcessByStdio } from 'child_process';
import { OnitConfigFileServeOnFirstTscCompilationSuccess, StringError } from '../../../../../types';

export type SpawnSubprocessResult = {
    kill:(cb: () => void) => void
};

export function spawnSubprocess (config: OnitConfigFileServeOnFirstTscCompilationSuccess ): SpawnSubprocessResult{
    if (!config.cmd){
        throw new StringError('onFirstTscCompilationSuccess missing cmd');
    }

    let proc: ChildProcessByStdio<any, null, null> | null = spawn(
        config.cmd,
        {
            stdio: [null, 'inherit', 'inherit'],
            shell: true,
            cwd: config.cwd ?? process.cwd()
        }
    );

    let killCb: (() => void) | null = null;
    proc.on('exit', (code: number) => {
        proc = null;
        if (killCb) killCb();
    });

    return {
        kill: (cb: () => void) => {
            if (proc) {
                killCb = cb;
                proc.kill();
            } else {
                cb();
            }
        }
    };
}

