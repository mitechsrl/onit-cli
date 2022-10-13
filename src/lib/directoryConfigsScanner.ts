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

/**
  * Search for subdirectories of dir which contains a valid config.js.
  * The goal is to detect all these directories and load their config.js files into an array, which will
  * tipycally be used for a user selection list.
  *
  * @param {*} dir
  * @returns
  */
export async function directoryConfigsScanner(dir: string){
    // load all the directories in this path. these are the configs
    const dirContent = await fs.promises.readdir(dir);
 
    // read all the directories only. We expect a config.js file in them. If not, skip it.
    const configs = await Promise.all(dirContent.map(async d => {
        d = path.join(dir, d);
        let config = null;
        if ((await fs.promises.stat(d)).isDirectory()) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                config = require(d + '/config.js').default;
                if (!config.value) config.value = {};
 
                if (typeof config.value === 'string') {
                    config.dir = d;
                } else {
                    config.value.dir = d;
                }
            } catch (e) {
                // do not add files with errors or the one for non -existent config.js
            }
            return config;
        }
        return config;
    }));
    return configs.filter(p => !!p); // throw away invalid configs
}