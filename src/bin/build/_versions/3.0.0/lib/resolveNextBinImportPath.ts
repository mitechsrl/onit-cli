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
import path from 'path';
import { GenericObject, StringError } from '../../../../../types';
import resolve from 'resolve';
import _ from 'lodash';

/**
 * Get the next bin path
 * @returns
 */
export function resolveNextBinImportPath() {
    // Cheat on the "main" path by setting it with the bin path. 
    // Resolve will retrn that value instead of mail.
    function packageFilter(pkg: GenericObject, dir: string) {
        const nextBinPath = _.get(pkg, 'bin.next', undefined);
        if (!nextBinPath)
            throw new StringError('No next-cli bin found');
        pkg.main = path.join(dir, nextBinPath);
        return pkg;
    }

    try {
        return resolve.sync('next', { packageFilter: packageFilter, basedir: process.cwd() });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.log(e);
        if (e.code === 'MODULE_NOT_FOUND')
            throw new StringError('Nextjs package not found. Make sure to have it installed as dependencty');
        throw e;
    }
}
