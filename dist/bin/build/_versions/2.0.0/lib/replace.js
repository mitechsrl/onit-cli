"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.replace = void 0;
function replace(obj, _vars) {
    // Make sure a order is respected to prevent overlapping names to interfere
    const vars = Object.entries(_vars).sort((a, b) => a[0] === b[0] ? 0 : (a[0] > b[0] ? -1 : 1));
    const stringReplace = function (v) {
        // eslint-disable-next-line no-constant-condition
        vars.forEach(variable => {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const replaced = v.replace(variable[0], variable[1]);
                if (v === replaced)
                    break;
                v = replaced;
            }
        });
        return v;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _replace = function (obj) {
        if (typeof obj === 'string')
            return stringReplace(obj);
        if (Array.isArray(obj))
            return obj.map(o => _replace(o));
        if (obj && typeof obj === 'object') {
            return Object.keys(obj).reduce((acc, k) => {
                acc[k] = _replace(obj[k]);
                return acc;
            }, {});
        }
        // Don't know what to do. Just return the obj
        return obj;
    };
    return _replace(obj);
}
exports.replace = replace;
//# sourceMappingURL=replace.js.map