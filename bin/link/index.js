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

const persistent = require('../../lib/persistent');
const path = require('path');
const fs = require('fs');

module.exports.info = 'Dev dependency link utility';
module.exports.help = [];

module.exports.cmd = async function (basepath, params, logger) {
    const packageJsonFilename = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonFilename)) {
        logger.error('Nessun package.json in questa directory.');
        return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonFilename).toString());
    const tag = packageJson.name;

    const force = params.get('-f').found;
    const config = persistent.get('dependency-link');
    if (!force && config[tag]) {
        logger.error('Tag <' + tag + '> già in uso. Usa -f per forzare la sovrascrittura');
        return;
    }

    config[tag] = process.cwd();

    persistent.set('dependency-link', config);

    logger.info('Tag ' + tag + ' creato. Punta a ' + process.cwd());
};
