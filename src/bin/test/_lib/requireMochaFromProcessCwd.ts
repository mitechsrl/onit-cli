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

import { logger } from '../../../lib/logger';
import Mocha from 'mocha';
import resolve from 'resolve';
import { StringError } from '../../../types';

/**
 * We relies on the local installed mocha instance to get the job done. Getting it
 * @returns 
 */
export function requireMochaFromProcessCwd(): null|Mocha {
    try{
        const requirePath = resolve.sync('mocha', { basedir: process.cwd() });
        if (requirePath) {
            logger.log('Found a mocha instance in ' + requirePath);
        }
        return require(requirePath);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }catch(e: any){
        if (e.code === 'MODULE_NOT_FOUND') throw new StringError('Cannot find a local instance of mocha. Please add the dependency @mitech/onit-dev-tools.');
        throw e;
    }
}
