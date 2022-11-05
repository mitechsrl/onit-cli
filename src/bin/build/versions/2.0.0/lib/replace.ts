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

import { GenericObject } from '../../../../../types';

export function replace(obj: GenericObject, vars: GenericObject) {
    const stringReplace = function (v:GenericObject) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            let found = false;
            Object.keys(vars).forEach(variable => {
                const _v = v.replace(variable, vars[variable]);
                found = found || _v !== v;
                v = _v;
            });
            if (!found) break;
        }
        return v;
    };

    const _replace = function (obj:GenericObject) {
        if (Array.isArray(obj)) obj.forEach(o => _replace(o));

        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(k => {
                if (typeof obj[k] === 'string') {
                    obj[k] = stringReplace(obj[k]);
                    return;
                }

                _replace(obj[k]);
            });
        }
    };

    _replace(obj);
    return obj;
}
