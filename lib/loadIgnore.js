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

const ignore = require('ignore');
const fs = require('fs');

module.exports = (ignoreFilesList = []) => {
    const _load = function (ignoreFileName) {
        // prepara gestione ignore files
        let ignoreFile = '';

        if (fs.existsSync(ignoreFileName)) {
            ignoreFile = fs.readFileSync(ignoreFileName).toString();
        }

        const ignoreFilters = ignoreFile
            .split('\n')
            .map(v => v.trim())
            .filter(v => v !== '')
            .filter(v => v[0] !== '#');

        return ignoreFilters;
    };

    const ignoreFilters = ignoreFilesList.reduce((acc, file) => {
        acc.push(..._load(file));
        return acc;
    }, []);

    return ignore().add(ignoreFilters);
};
