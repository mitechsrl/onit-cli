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
exports.copyExtraFiles = void 0;
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const fs_1 = __importDefault(require("fs"));
async function copyExtraFiles(onitConfigFile) {
    let watcher = undefined;
    const copyFiles = onitConfigFile.json.copyFiles;
    return {
        /**
         * Launch the file change watcher
         * @param {*} onReady callback called after the initial scan has completed
         */
        start: (onReady) => {
            if (copyFiles && copyFiles.from && copyFiles.glob && copyFiles.glob.length > 0) {
                const to = copyFiles.to || path_1.default.join(process.cwd(), './dist');
                const srcPath = path_1.default.join(process.cwd(), copyFiles.from);
                const dstPath = path_1.default.join(process.cwd(), to);
                watcher = chokidar_1.default.watch(copyFiles.glob);
                // watch for add & chenges
                // NOTE: the add will be triggered at any start, so when this function is launched,
                // a fisto copy of all the files will be triggered.
                // subsequential copies are performed on change.
                const addChange = async (filePath) => {
                    const srcFileFullPath = path_1.default.join(process.cwd(), filePath);
                    const dstFileFullPath = srcFileFullPath.replace(srcPath, dstPath);
                    const _p = path_1.default.dirname(dstFileFullPath);
                    if (!fs_1.default.existsSync(_p)) {
                        await fs_1.default.promises.mkdir(_p, { recursive: true });
                    }
                    await fs_1.default.promises.copyFile(srcFileFullPath, dstFileFullPath, fs_1.default.constants.COPYFILE_FICLONE);
                };
                watcher.on('add', addChange);
                watcher.on('change', addChange);
                // watch for delete
                const unlink = async (filePath) => {
                    console.log('unlink ', filePath);
                    const srcFileFullPath = path_1.default.join(process.cwd(), filePath);
                    const dstFileFullPath = srcFileFullPath.replace(srcPath, dstPath);
                    await fs_1.default.promises.unlink(dstFileFullPath);
                };
                watcher.on('unlink', unlink);
                // initial scan finished
                watcher.on('ready', onReady);
            }
            else {
                // no stuff to be copied. Just launch the callback
                process.nextTick(onReady);
            }
        },
        /**
         * Stop and close the watcher.
         */
        close: async () => {
            if (watcher) {
                await watcher.close();
            }
        }
    };
}
exports.copyExtraFiles = copyExtraFiles;
//# sourceMappingURL=copyExtraFiles.js.map