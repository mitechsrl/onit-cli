import { GenericObject } from '../../../types';
export declare function mixinToArtifactFileName(mixinClass: string): string;
/**
 * rompt the mixin selection checkboxes
 * @param {*} artifactInfo
 */
export declare function promptMixinSelection(localDir: string, artifactInfo: GenericObject): Promise<void>;
