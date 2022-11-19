/*
Copyright (c) 2021 Mitech S.R.L.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
import fs from 'fs';
import path from 'path';
import { GenericObject } from '../types';
import os from 'os';

let baseConfigDir = path.join(os.homedir(), './.onit-cli');

export { baseConfigDir };

/**
 * Check existence of dir for a gven key.
 * If not available, the dir is created
 * @param key 
 */
function checkDir(key: string) {
    if (!fs.existsSync(baseConfigDir)) {
        fs.mkdirSync(baseConfigDir);
    }

    if (key) {
        const keyPath = path.join(baseConfigDir, './' + key);
        if (!fs.existsSync(keyPath)) {
            fs.mkdirSync(keyPath);
        }
    }
}

/**
 * Get the persistent file for a specified key
 * 
 * @param key 
 * @param filename 
 * @returns 
 */
export function getPersistent(key: string, filename?: string): GenericObject {
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
 * Set the persisted value for a specified key
 * 
 * @param key 
 * @param obj 
 * @param filename 
 */
export function setPersistent(key: string, obj: GenericObject, filename?: string) {
    checkDir(key);

    let _filename = baseConfigDir;
    if (key) {
        _filename = path.join(_filename, './' + key);
    }

    _filename = path.join(_filename, './' + (filename || 'config.json'));

    fs.writeFileSync(_filename, JSON.stringify(obj, null, 4));
}
