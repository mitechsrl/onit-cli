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

import os from 'os';
import { packageJson } from './packageJson';
import updateNotifier from 'simple-update-notifier';
import { spawn, SpawnOptions } from './spawn';

// windows being windows... it wants the .cmd extension!
const npmExecutable = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
const npxExecutable = os.platform() === 'win32' ? 'npx.cmd' : 'npx';

/**
 * Check for newer versions and show a info in the console
 * This is just for a reminder, doesn't do anything else.
 * Check is performed once a day
 */
export async function npmVersionCheck() {
    await updateNotifier({ pkg: packageJson, updateCheckInterval: 1000 * 60 * 60 * 24 });
}

/**
 * Proxy method to spawn npm process
 */
export async function npm(params: string[], options?: SpawnOptions ){
    return spawn(npmExecutable, params, Object.assign({ shell:true }, options ?? {}));
}

/**
 * Proxy method to spawn npx process
 */
export async function npx(params: string[], options?: SpawnOptions ){
    return spawn(npxExecutable, params, Object.assign({ shell:true }, options ?? {}));
}