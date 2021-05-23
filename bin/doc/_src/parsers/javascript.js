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


const { parse, stringify } = require('comment-parser/lib');

module.exports.parse = (fileContent, blocks) => {
    const commentBlocks = parse(fileContent);

    commentBlocks.forEach(block => {
        const onitBlock = {};

        const onitDoc = block.tags.find(t => t.tag === 'onitDoc');
        if (!onitDoc) return;

        let start = '';
        onitDoc.source.forEach(s => {
            if (s.tokens.tag === '@onitDoc') start = s.tokens.start;
            s.tokens.start = s.tokens.start.replace(new RegExp('^' + start), '');
            s.tokens.end = '';
            s.tokens.tag = '';
            s.tokens.delimiter = '';
        });
        onitBlock.doc = stringify(onitDoc);

        const onitChapter = block.tags.find(t => t.tag === 'onitChapter');
        if (onitChapter) {
            onitBlock.chapter = onitChapter.name;
        } else {
            return;
        }

        const onitTitle = block.tags.find(t => t.tag === 'onitTitle');
        if (onitTitle) {
            onitBlock.title = onitTitle.name + ' ' + onitTitle.description;
        }

        const onitPriority = block.tags.find(t => t.tag === 'onitPriority');
        if (onitPriority) {
            onitBlock.priority = parseInt(onitPriority.name);
        } else {
            onitBlock.priority = 1000;
        }

        console.log("PRIOOOOO", onitBlock.priority);

        const onitType = block.tags.find(t => t.tag === 'onitType');
        if (onitType) {
            onitBlock.type = onitType.name + ' ' + onitType.description;
        }

        const params = block.tags.filter(b => b.tag === 'param');
        onitBlock.params = onitBlock.params || [];
        onitBlock.params.push(...params);

        blocks.chapters[onitBlock.chapter] = blocks.chapters[onitBlock.chapter] || [];
        blocks.chapters[onitBlock.chapter].push(onitBlock);
    });

    return blocks;
};
