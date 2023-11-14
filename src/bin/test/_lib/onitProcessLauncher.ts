import { OnitConfigFile, OnitConfigFileTestTarget, StringError } from '../../../types';
import { getMainExecutableFilePath } from '../../serve/_versions/2.0.0/lib/spawnNodeProcess';
import { join } from 'path';

/**
 *
 * @param {*} onitConfigFile
 * @param {*} testTarget
 */
export async function onitProcessLauncher(onitConfigFile: OnitConfigFile, testTarget: OnitConfigFileTestTarget) {
    // find the main onit js file
    const mainFile = getMainExecutableFilePath(onitConfigFile, testTarget);
    if (!mainFile) {
        throw new StringError('Cannot detect onit entry point file.');
    }
    // Require onit and launch it
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const onit = require(join(process.cwd(), mainFile));
    const onitInstance = await onit.launch();

    // wait just some seconds to allow all async stuff to be initialized
    await new Promise(resolve => setTimeout(resolve, 4000));

    return {
        onit: onitInstance,
        // callback to stop onit
        stop: () => {
            return new Promise(resolve => {
                // Debouncer for timeout
                let _timeout: NodeJS.Timeout | null = null;
                const resolveTimer = (n: number) => {
                    if (_timeout!==null) clearTimeout(_timeout);
                    _timeout = setTimeout(() => {
                        _timeout = null;
                        resolve(null);
                    }, n);
                };

                onitInstance.lbApp.onStop(() => { resolveTimer(2000); });
                resolveTimer(5000); // Still forcefully resolve if nothing happens
                onitInstance.stop(false);
            });
        }
    };
}
