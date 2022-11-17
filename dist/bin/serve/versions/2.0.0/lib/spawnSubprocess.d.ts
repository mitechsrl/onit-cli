import { OnitConfigFileServeOnFirstTscCompilationSuccess } from '../../../../../types';
export type SpawnSubprocessResult = {
    kill: (cb: () => void) => void;
};
export declare function spawnSubprocess(config: OnitConfigFileServeOnFirstTscCompilationSuccess): SpawnSubprocessResult;
