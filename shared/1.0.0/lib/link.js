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
const path = require('path');
const fs = require('fs').promises;
const spawn = require('../../../lib/spawn');

// windows being windows.. need a ".cmd" extension
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');
const npmExec = isWindows ? 'npm.cmd' : 'npm';

async function start (logger, onitConfigFile) {
    // do we have links to be checked?
    if (!onitConfigFile.json.link || onitConfigFile.json.link.length === 0) {
        return null;
    }

    // if we have some links definitions iterate over them and check each one
    for await (const l of onitConfigFile.json.link) {
        const p = path.resolve(process.cwd(), './node_modules', './' + l.link);
        let stat = null;
        let error = null;

        // use lstat instead of stat so we can use his  isSymbolicLink function
        try {
            stat = await fs.lstat(p);
        } catch (e) {
            error = e;
        }

        // does the  file exists? If not, create it
        if (error && error.code === 'ENOENT') {
            logger.warn(p + ' does not exists. Adding with <npm link ' + l.link + '>');
            const exit = await spawn(npmExec, ['link', l.link], true, { shell: true });
            if (exit.exitCode !== 0) throw new Error(exit.data);

        // is this a symlink?
        } else if (stat && !stat.isSymbolicLink()) {
            logger.warn(p + ' non è un symlink. eseguo <npm link ' + l.link + '>');
            await spawn(npmExec, ['link', l.link], true, { shell: true });

        // got some other error
        } else if (error) {
            throw error;
        }
    };
}
module.exports.start = start;
