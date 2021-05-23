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


module.exports = {
    verbose: false,
    ext: 'js,json,jsonc',
    ignore: [
        '*/node_modules/*', // never ever watch any node_module dir
        '*/extras/*', // this is a placeholder folder for generic project-related files. Don't watch it.
        '*/react/*', // changes to react folders do not cause reloads since they are managed by webpack
        'dev-utils/*', // changes to dev utils do not cause reloads since they are called by npm scripts
        'git.json', // git.json statis file. Probably removed in future
        '*/static/*', // any static folder don't cause reloads
        '*/assets/*', // static assets changes don't cause reloads
        '*/dist-fe/*' // target directory for webpack compiled files. Don't reload on these files changes
    ],
    nodeArgs: [
        '--max-old-space-size=4096' // increase the heap limit
    ],
    env: {} // empty env to be filled later
};
