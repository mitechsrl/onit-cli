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

import inquirer from 'inquirer';
import { GenericObject, StringError } from '../types';
import { logger } from './logger';
import { getPersistent, setPersistent } from './persistent';

export type NpmRegistry = {
    scope?: string,
    registry: string,
    managementAccount?: {
        username: string,
        password: string,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k: string]: any
};

// windows fa il windows percui lui vuole 'npm.cmd' anzichè 'npm' come comando di avvio
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');
export const npmExecutable = isWindows ? 'npm.cmd' : 'npm';

/**
 * ottiene url del registry per lo scope scelto
 */
export async function getRegistry(scope?: string, defaultRegistryId?: string, defaultIfSingle = true) {
    try {
        let registries = getPersistent('npm') as GenericObject[];
        if (!Array.isArray(registries) && Object.keys(registries).length === 0) {
            registries = [];
        }

        if (scope) {
            registries = registries.filter(r => r.scope === scope);
        }

        if (registries.length === 0) {
            const settings: string[] = [];
            if (scope) settings.push('scope: ' + scope);
            if (defaultRegistryId) settings.push('id: ' + defaultRegistryId);
            let stringSettings = settings.join(',');
            stringSettings = stringSettings !== '' ? 'per ' + settings : '';
            throw new StringError('Nessun registro npm definito ' + stringSettings + '. Usa <mitech npm registry add> per crearne uno');
        }

        // do we have something passed as parameter?
        if (defaultRegistryId) {
            const defaultRegistry = registries.find(r => r.id === defaultRegistryId);
            if (defaultRegistry) return defaultRegistry;
        }

        if (defaultIfSingle && registries.length === 1) return registries[0];

        logger.log('Seleziona il registry');
        // ask the user for registry
        const questions = [{
            type: 'list',
            name: 'registry',
            message: 'Seleziona un registry',
            choices: registries.map(r => ({ name: r.id + ' (scope: ' + r.scope + ', url: ' + r.registry + ')', value: r }))
        }];
        const answers = await inquirer.prompt(questions);
        return answers.registry;
        
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        throw new StringError(e.message || e);
    }
}

/**
 * Costruisce il contenuto del file .npmrc con le credenziali per il registry di turno
 */
export function buildNpmrc(registry: NpmRegistry, account = 'managementAccount') {
    try {
        const hostname = new URL(registry.registry).hostname;

        let npmrc = 'registry=https://registry.npmjs.org/\r\n';
        npmrc = npmrc + registry.scope + ':registry=' + registry.registry + '\r\n';
        npmrc = npmrc + '//' + hostname + '/:username=' + registry[account].username + '\r\n';
        npmrc = npmrc + '//' + hostname + '/:_password=' + Buffer.from(registry[account].password).toString('base64');

        return npmrc;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        throw e.message || e;
    }
}

/**
 * get the stored registries data
 * @returns 
 */
export function getNpmPersistent() {
    let registries = getPersistent('npm') as NpmRegistry[];
    if (!Array.isArray(registries) && Object.keys(registries).length === 0) {
        registries = [];
    }
    return registries;
}

/**
 * get the stored registries data
 * @returns 
 */
export function setNpmPersistent(registries: NpmRegistry[]) {
    setPersistent('npm', registries);
}