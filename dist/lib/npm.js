"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setNpmPersistent = exports.getNpmPersistent = exports.buildNpmrc = exports.getRegistry = exports.npmExecutable = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const types_1 = require("../types");
const logger_1 = require("./logger");
const persistent_1 = require("./persistent");
// windows fa il windows percui lui vuole 'npm.cmd' anzichè 'npm' come comando di avvio
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');
exports.npmExecutable = isWindows ? 'npm.cmd' : 'npm';
/**
 * ottiene url del registry per lo scope scelto
 */
async function getRegistry(scope, defaultRegistryId, defaultIfSingle = true) {
    try {
        let registries = (0, persistent_1.getPersistent)('npm');
        if (!Array.isArray(registries) && Object.keys(registries).length === 0) {
            registries = [];
        }
        if (scope) {
            registries = registries.filter(r => r.scope === scope);
        }
        if (registries.length === 0) {
            const settings = [];
            if (scope)
                settings.push('scope: ' + scope);
            if (defaultRegistryId)
                settings.push('id: ' + defaultRegistryId);
            let stringSettings = settings.join(',');
            stringSettings = stringSettings !== '' ? 'per ' + settings : '';
            throw new types_1.StringError('Nessun registro npm definito ' + stringSettings + '. Usa <mitech npm registry add> per crearne uno');
        }
        // do we have something passed as parameter?
        if (defaultRegistryId) {
            const defaultRegistry = registries.find(r => r.id === defaultRegistryId);
            if (defaultRegistry)
                return defaultRegistry;
        }
        if (defaultIfSingle && registries.length === 1)
            return registries[0];
        logger_1.logger.log('Seleziona il registry');
        // ask the user for registry
        const questions = [{
                type: 'list',
                name: 'registry',
                message: 'Seleziona un registry',
                choices: registries.map(r => ({ name: r.id + ' (scope: ' + r.scope + ', url: ' + r.registry + ')', value: r }))
            }];
        const answers = await inquirer_1.default.prompt(questions);
        return answers.registry;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        throw new types_1.StringError(e.message || e);
    }
}
exports.getRegistry = getRegistry;
/**
 * Costruisce il contenuto del file .npmrc con le credenziali per il registry di turno
 */
function buildNpmrc(registry, account = 'managementAccount') {
    try {
        const hostname = new URL(registry.registry).hostname;
        let npmrc = 'registry=https://registry.npmjs.org/\r\n';
        npmrc = npmrc + registry.scope + ':registry=' + registry.registry + '\r\n';
        npmrc = npmrc + '//' + hostname + '/:username=' + registry[account].username + '\r\n';
        npmrc = npmrc + '//' + hostname + '/:_password=' + Buffer.from(registry[account].password).toString('base64');
        return npmrc;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        throw e.message || e;
    }
}
exports.buildNpmrc = buildNpmrc;
/**
 * get the stored registries data
 * @returns
 */
function getNpmPersistent() {
    let registries = (0, persistent_1.getPersistent)('npm');
    if (!Array.isArray(registries) && Object.keys(registries).length === 0) {
        registries = [];
    }
    return registries;
}
exports.getNpmPersistent = getNpmPersistent;
/**
 * get the stored registries data
 * @returns
 */
function setNpmPersistent(registries) {
    (0, persistent_1.setPersistent)('npm', registries);
}
exports.setNpmPersistent = setNpmPersistent;
//# sourceMappingURL=npm.js.map