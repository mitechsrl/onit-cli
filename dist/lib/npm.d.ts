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
export declare type NpmRegistry = {
    scope?: string;
    registry: string;
    managementAccount?: {
        username: string;
        password: string;
    };
    [k: string]: any;
};
export declare const npmExecutable: string;
/**
 * ottiene url del registry per lo scope scelto
 */
export declare function getRegistry(scope?: string, defaultRegistryId?: string, defaultIfSingle?: boolean): Promise<any>;
/**
 * Costruisce il contenuto del file .npmrc con le credenziali per il registry di turno
 */
export declare function buildNpmrc(registry: NpmRegistry, account?: string): string;
/**
 * get the stored registries data
 * @returns
 */
export declare function getNpmPersistent(): NpmRegistry[];
/**
 * get the stored registries data
 * @returns
 */
export declare function setNpmPersistent(registries: NpmRegistry[]): void;
