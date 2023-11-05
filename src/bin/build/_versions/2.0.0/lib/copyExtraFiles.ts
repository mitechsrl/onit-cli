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

import { OnitConfigFile } from '../../../../../types';
import path from 'path';
import chokidar from 'chokidar';
import fs from 'fs';

export async function copyExtraFiles(onitConfigFile: OnitConfigFile){
    let watcher: chokidar.FSWatcher | undefined = undefined;
    const copyFiles = onitConfigFile.json.copyFiles;

    return {

        /**
         * Launch the file change watcher
         * @param {*} onReady callback called after the initial scan has completed
         */
        start: (onReady: () => void) => {

            if (copyFiles && copyFiles.from && copyFiles.glob && copyFiles.glob.length > 0) {
                const to = copyFiles.to || path.join(process.cwd(), './dist');
                const srcPath = path.join(process.cwd(), copyFiles.from);
                const dstPath = path.join(process.cwd(), to);

                watcher = chokidar.watch(copyFiles.glob);

                // watch for add & chenges
                // NOTE: the add will be triggered at any start, so when this function is launched,
                // a fisto copy of all the files will be triggered.
                // subsequential copies are performed on change.
                const addChange = (filePath: string) => {
                    const srcFileFullPath = path.join(process.cwd(), filePath);
                    const dstFileFullPath = srcFileFullPath.replace(srcPath, dstPath);
                    const _p = path.dirname(dstFileFullPath);
                    if (!fs.existsSync(_p)){
                        fs.mkdirSync(_p, { recursive: true });
                    }

                    let copy = true;
                    try{
                        // Try to not copy files if they are already there and save up time
                        const statDst = fs.statSync(dstFileFullPath);
                        const statSrc = fs.statSync(srcFileFullPath);
                        // Do not copy if filesize is the same and last modified time is the same
                        if ((statSrc.mtime === statDst.mtime) && (statSrc.size == statDst.size)){
                            copy = false;
                        }
                    }catch(e){
                        // Checks failed. To be sure, fallback to "copy=true"
                        copy = true;
                    }
                    
                    if (!copy)return;
                
                    fs.copyFileSync(srcFileFullPath, dstFileFullPath, fs.constants.COPYFILE_FICLONE);
                    
                };
                watcher.on('add', addChange);
                watcher.on('change', addChange);

                // watch for delete
                const unlink = async (filePath: string) => {
                    console.log('unlink ', filePath);
                    const srcFileFullPath = path.join(process.cwd(), filePath);
                    const dstFileFullPath = srcFileFullPath.replace(srcPath, dstPath);
                    await fs.promises.unlink(dstFileFullPath);
                };
                watcher.on('unlink', unlink);

                // initial scan finished
                watcher.on('ready', onReady);
            } else {
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
