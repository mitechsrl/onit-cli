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
import maxSatisfying from 'semver/ranges/max-satisfying';
import { logger } from './logger';

/**
 * Scan a directory which is supposed to contain multiple versions of the same subprogram, 
 * then load the version which match the provided requiredVersion constraint.
 * 
 * The directory (myDir) is supposed to contain a structure like:
 * - myDir
 *   - 1.0.0
 *     - index.ts
 *   - 2.0.0
 *     - index.ts
 *   - 2.1.0
 *     - index.ts
 * The loader will use semver to select the best match for he provided requiredVersion
 * (which must follow semver constraint format) then load the relative index.ts file and return it.
 * 
 * @param versionsDir a directory path
 * @param requiredVersion A semver version constraint (^1.2.3, ~1.5.0 or anything like this)
 * @returns A object {required: any, version:string} where required is the loaded script (one of the index.ts files) 
 * and version is the version of the loaded script which best matched the requiredVersion param
 *  
 */
export function loadVersionDir(versionsDir:string, requiredVersion:string, name: string){
    // get a list of the available versions (each dir describe one version)
    const availableVersions = fs.readdirSync(versionsDir);

    // use npm semver to select the most recent usable version
    const version = maxSatisfying(availableVersions, requiredVersion);
    if (!version){
        throw new Error(`No compatible ${name} version found for required ${requiredVersion}. Check your onit config file version or ${name}.version value.`);
    }

    // version found: Load that builder and use it.
    logger.info(`Using ${name} version ${version}`);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return {
        required: require(path.join(versionsDir, `./${version}/index.js`)),
        version: version
    };
}