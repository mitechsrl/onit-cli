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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runClean = void 0;
const logger_1 = require("../../../../../lib/logger");
const fs_extra_1 = __importDefault(require("fs-extra"));
const fs_1 = __importDefault(require("fs"));
const npm_1 = require("../../../../../lib/npm");
/**
 * Ensure path does not exist
 * @param {*} localPath
 */
function removePath(localPath) {
    if (fs_extra_1.default.pathExistsSync(localPath)) {
        logger_1.logger.log('Remove ' + localPath);
        fs_extra_1.default.removeSync(localPath);
    }
}
/**
 * Ensure the passed in files does not exist
 */
function removeFiles(files) {
    files.forEach(f => {
        if (fs_1.default.existsSync(f)) {
            logger_1.logger.log('Remove ' + f);
            fs_1.default.unlinkSync(f);
        }
    });
}
/**
 * Clean the build directory
 *
 * @param onitConfigFile
 * @param cwdPackageJson
 * @returns
 */
async function runClean(onitConfigFile, cwdPackageJson) {
    logger_1.logger.info('[CLEAN] Cleaning directory...');
    // if defined, launch the clean script
    if ((cwdPackageJson.scripts || {}).clean) {
        await (0, npm_1.npm)(['run', 'clean'], {
            cwd: process.cwd()
        });
    }
    // Also remove by default some of our own dir/files
    removePath('dist-fe');
    removePath('dist');
    removeFiles(['tsconfig.tsbuildinfo']);
    logger_1.logger.info('[CLEAN] Directory cleaned!');
    return 0;
}
exports.runClean = runClean;
//# sourceMappingURL=clean.js.map