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

const fse = require('fs-extra');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

module.exports = (logger, onitConfigFile, targetDir) => {
    let watcher = null;
    const copyFiles = onitConfigFile.json.copyFiles;
    return {
        start: (onReady) => {
            if (copyFiles && copyFiles.glob && copyFiles.glob.length > 0) {
                const srcPath = path.join(process.cwd(), copyFiles.from);
                const dstPath = path.join(process.cwd(), copyFiles.to);

                watcher = chokidar.watch(copyFiles.glob);

                // watch for add & chenges
                const addChange = async (filePath) => {
                    const srcFileFullPath = path.join(process.cwd(), filePath);
                    const dstFileFullPath = srcFileFullPath.replace(srcPath, dstPath);
                    await fse.ensureDir(path.dirname(dstFileFullPath));
                    await fs.promises.copyFile(srcFileFullPath, dstFileFullPath, fs.constants.COPYFILE_FICLONE);
                };
                watcher.on('add', addChange);
                watcher.on('change', addChange);

                // watch for delete
                const unlink = async (filePath) => {
                    console.log("unlink ", filePath);
                    const srcFileFullPath = path.join(process.cwd(), filePath);
                    const dstFileFullPath = srcFileFullPath.replace(srcPath, dstPath);
                    await fs.promises.unlink(dstFileFullPath);
                };
                watcher.on('unlink', unlink);

                // initial scan finished
                watcher.on('ready', onReady);
            } else {
                onReady();
            }
        },
        close: async () => {
            if (watcher) {
                await watcher.close();
            }
        }
    };
};
