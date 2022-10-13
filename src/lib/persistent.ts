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

import fs from 'fs';
import path from 'path';
import { GenericObject } from '../types';

export const baseConfigDir = path.join(process.env.APPDATA as string, './mitech-cli');

/**
 * Check existence of dir for a gven key.
 * If not available, the dir is created
 * @param key 
 */
function checkDir(key:string) {
    const mitechCliDbPath = baseConfigDir;
    if (!fs.existsSync(mitechCliDbPath)) {
        fs.mkdirSync(mitechCliDbPath);
    }

    if (key) {
        const keyPath = path.join(mitechCliDbPath, './' + key);
        if (!fs.existsSync(keyPath)) {
            fs.mkdirSync(keyPath);
        }
    }
}

/**
 * 
 * @param key 
 * @param filename 
 * @returns 
 */
export function getPersistent(key:string, filename?:string): GenericObject {
    checkDir(key);

    let _filename = baseConfigDir;
    if (key) {
        _filename = path.join(_filename, './' + key);
    }

    _filename = path.join(_filename, './' + (filename || 'config.json'));

    if (!fs.existsSync(_filename)) {
        fs.writeFileSync(_filename, '{}');
        return {};
    } else {
        return JSON.parse(fs.readFileSync(_filename).toString());
    }
}

/**
 * 
 * @param key 
 * @param obj 
 * @param filename 
 */
export function setPersistent(key:string, obj:GenericObject, filename?:string) {
    checkDir(key);

    let _filename = baseConfigDir;
    if (key) {
        _filename = path.join(_filename, './' + key);
    }

    _filename = path.join(_filename, './' + (filename || 'config.json'));

    fs.writeFileSync(_filename, JSON.stringify(obj, null, 4));
}
