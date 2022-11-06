import { CommandExecFunction, GenericObject } from '../../../types';
/**
 * Prompt the user tfor repository generation
 *
 * @param repoGeneratorParams
 */
export declare function repoGenerator(repoGeneratorParams?: GenericObject): Promise<void>;
declare const exec: CommandExecFunction;
export default exec;
