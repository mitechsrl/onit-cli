import { OnitConfigFile } from '../../../../../types';
export declare function copyExtraFiles(onitConfigFile: OnitConfigFile): Promise<{
    /**
     * Launch the file change watcher
     * @param {*} onReady callback called after the initial scan has completed
     */
    start: (onReady: () => void) => void;
    /**
     * Stop and close the watcher.
     */
    close: () => Promise<void>;
}>;
