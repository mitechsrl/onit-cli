import { GenericObject } from '../../../../types';
/**
 * Removes the original git repo and init a new one
 * @param {*} cwd
 * @param {*} answers
 */
export declare function unlinkGitRepo(cwd: string, answers: GenericObject): Promise<void>;
export declare function commitRepo(cwd: string, answers: GenericObject): Promise<void>;
