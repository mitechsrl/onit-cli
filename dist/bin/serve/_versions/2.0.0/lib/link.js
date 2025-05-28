"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOnitConfigFileLinks = void 0;
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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../../../lib/logger");
const npm_1 = require("../../../../../lib/npm");
/**
 * Create the link. Based on the provided target, it either uses the standard npm link or a custom one
 * @param {*} l
 */
async function createLink(configFile, l) {
    if (!l.target) {
        // providing just the "link" property uses the standard npm link
        logger_1.logger.log('Eseguo <npm link ' + l.link + '>');
        await (0, npm_1.npm)(['link', l.link]);
    }
    else {
        // providing target will make this utility to create the link to the target directory
        logger_1.logger.log('Creo symlink ' + l.link + ' verso ' + l.target);
        const p = path_1.default.resolve(process.cwd(), './node_modules', './' + l.link);
        try {
            const resolveBase = configFile ? path_1.default.dirname(configFile) : process.cwd();
            const resolvedTarget = path_1.default.resolve(resolveBase, l.target);
            await fs_1.default.promises.symlink(resolvedTarget, p, 'junction');
        }
        catch (e) {
            logger_1.logger.error('Symlink creation failed. Please check You don\'t have this module installed as standard dependency');
            throw e;
        }
    }
}
/**
 * Process onitConfigFile.json.link and create local links. This method is a proxy to npm link.
 *
 * @param onitConfigFile The config file content
 * @returns
 */
async function processOnitConfigFileLinks(onitConfigFile) {
    // do we have links to be checked?
    if (!onitConfigFile.json.link || onitConfigFile.json.link.length === 0) {
        return null;
    }
    // if we have some links definitions iterate over them and check each one
    for (const l of onitConfigFile.json.link) {
        const p = path_1.default.resolve(process.cwd(), './node_modules', './' + l.link);
        let stat = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let error = null;
        // use lstat instead of stat so we can use his isSymbolicLink function
        try {
            stat = await fs_1.default.promises.lstat(p);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            error = e;
        }
        // does the  file exists? If not, create it
        if (error && error.code === 'ENOENT') {
            logger_1.logger.warn(p + ' non esiste.');
            await createLink(onitConfigFile.sources[0], l);
            // is this a symlink?
        }
        else if (stat && !stat.isSymbolicLink()) {
            logger_1.logger.warn(p + ' non è un symlink.');
            await createLink(onitConfigFile.sources[0], l);
            // got some other error
        }
        else if (error) {
            throw error;
        }
    }
}
exports.processOnitConfigFileLinks = processOnitConfigFileLinks;
//# sourceMappingURL=link.js.map