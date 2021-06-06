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

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
/**
 * Generate a block markdown
 *
 * @param {*} block
 * @returns
 */
const generateBlock = (block) => {
    let str = '';

    // autoset the title but only if the docs don't starts with his own title
    block.doc = block.doc.trim();

    if (!block.doc.startsWith('#')) { str += '## ' + block.title + '\n\n'; }

    str += block.doc + '\n\n';

    if (block.params.length > 0) {
        str += '#### Params\n';
    }

    block.params.forEach(param => {
        str += '##### **' + param.name + '**\n';
        param.source.forEach(s => {
            s.tokens.start = '';
            s.tokens.delimiter = '';
            s.tokens.end = '';
            s.tokens.tag = '';
            s.tokens.type = '';
            s.tokens.name = '';
            s.tokens.postDelimiter = s.tokens.postDelimiter.split('').slice(1).join('');
        });
        str += param.source.map(s => s.tokens.postDelimiter + s.tokens.description).join('\n');
        str += '\n\n';
    });

    return str;
};

const reduceJekillHeader = (acc, e) => {
    if (typeof e === 'string') acc = acc + '\n' + e;
    if (Array.isArray(e)) acc = acc + '\n' + e[0] + ': ' + e[1];
    return acc.trim();
};

function createFile (filename, header, content = '') {
    const jekillHeader = [
        '---',
        ['layout', 'page'],
        ...Object.entries(header || {}),
        '---'
    ].reduce(reduceJekillHeader, '');

    fs.writeFileSync(filename, jekillHeader + content);
}
/**
 * Write ot parsed files
 * @param {*} blocks
 */
const writeFile = function (configFile, blocks, output) {
    const chapterKeys = Object.keys(configFile.chapters);
    chapterKeys.sort();

    const outDir = path.join(process.cwd(), output.found ? output.value : '/onit-doc/');
    fs.mkdirSync(outDir, { recursive: true });

    chapterKeys.forEach(chapter => {
        const chapterKey = chapter;
        const parentChapterKey = chapterKey.split('.').slice(0, -1).join('.');
        const grandParentChapterKey = parentChapterKey.split('.').slice(0, -1).join('.');
        let chapterFileContent = '';

        const chapterConfig = configFile.chapters[chapterKey];
        const parentChapterConfig = parentChapterKey ? configFile.chapters[parentChapterKey] : null;
        const grandParentChapterConfig = grandParentChapterKey ? configFile.chapters[grandParentChapterKey] : null;

        // calculate the destination directory file
        const fileDir = path.resolve(outDir, './' + chapterKey.split('.').join('/'));

        fse.removeSync(fileDir);
        // ensure we have the destination folder
        fs.mkdirSync(fileDir, { recursive: true });

        // this chapter defines a index configuration. Add the 'index.md' file
        if (chapterConfig.index) {
            chapterConfig.index.title = chapterConfig.title;
            const indexFullPath = path.join(fileDir, 'index.md');

            if (chapterKeys.some(k => k.startsWith(chapterKey + '.'))) {
                chapterConfig.index.has_children = 'true';
            }
            // setup hierarchy references
            if (parentChapterConfig) chapterConfig.index.parent = parentChapterConfig.title;
            if (grandParentChapterConfig) chapterConfig.index.grand_parent = grandParentChapterConfig.title;

            createFile(indexFullPath, chapterConfig.index);
        }

        // this chapter defines a standard page configuration. Add the file with
        if (chapterConfig.page) {
            chapterConfig.page.title = chapterConfig.title;

            // setup hierarchy references
            if (parentChapterConfig) chapterConfig.page.parent = parentChapterConfig.title;
            if (grandParentChapterConfig) chapterConfig.page.grand_parent = grandParentChapterConfig.title;

            // add extracted blocks markdown
            if (blocks.chapters[chapterKey]) {
                // sort them
                blocks.chapters[chapterKey].sort((a, b) => a.priority - b.priority);
                // merge all the blocks for this chapter into a "mega arkdown text"
                chapterFileContent = blocks.chapters[chapterKey].map(block => generateBlock(block)).join('\n\n');
            }

            const fileFullPath = path.join(fileDir, chapterConfig.title.replace(/[^a-zA-Z0-9]/g, '-') + '.md');
            createFile(fileFullPath, chapterConfig.page, '\n\n\n' + chapterFileContent);
        }
    });
};

module.exports = {
    writeFile: writeFile
};
