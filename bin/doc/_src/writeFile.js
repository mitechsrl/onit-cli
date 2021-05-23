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

/**
 * Write ot parsed files
 * @param {*} blocks
 */
const writeFile = function (configFile, blocks, output) {
    const chapterKeys = Object.keys(blocks.chapters);
    chapterKeys.sort();

    const outDir = path.join(process.cwd(), output.found ? output.value : '/onit-doc/');
    fs.mkdirSync(outDir, { recursive: true });
    chapterKeys.forEach(chapter => {
        const chapterKey = chapter;

        let chapterName = (configFile.chapterTitles[chapterKey] || '').replace(/[^a-zA-Z0-9]/g, '-');
        if (chapterName) {
            chapterName = '-' + chapterName;
        } else {
            try {
                chapterName = '-' + blocks.chapters[chapterKey][0].title.trim();
            } catch (e) {}
        }
        const file = path.join(outDir, chapterKey + chapterName + '.md');

        blocks.chapters[chapterKey].sort((a, b) => a.priority - b.priority);

        const chapterFileContent = blocks.chapters[chapterKey].map(block => generateBlock(block)).join('\n\n');
        fs.writeFileSync(file, chapterFileContent);
    });
};

module.exports = {
    writeFile: writeFile
};
