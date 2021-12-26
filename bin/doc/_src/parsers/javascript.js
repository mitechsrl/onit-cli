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

const { parse, stringify } = require('comment-parser');
const { priorityConverter } = require('../lib/priority');

module.exports.parse = (fileContent, filePath, blocks) => {
    const commentBlocks = parse(fileContent);

    commentBlocks.forEach(block => {
        const onitBlock = {
            filePath: filePath
        };

        // do not process anything if this tag is not set.
        const onitDoc = block.tags.find(t => t.tag === 'onitDoc');
        if (!onitDoc) return;

        let start = '';
        let postDelimiter = '';
        onitDoc.source.forEach(s => {
            if (s.tokens.tag === '@onitDoc') {
                // get the spacing of this tag and remove the spaces for alll the text based on this
                start = s.tokens.start;
                postDelimiter = s.tokens.postDelimiter;
            }
            s.tokens.start = s.tokens.start.replace(new RegExp('^' + start), '');
            s.tokens.end = '';
            s.tokens.tag = '';
            s.tokens.delimiter = '';
            s.tokens.postDelimiter = s.tokens.postDelimiter.replace(new RegExp('^' + postDelimiter), '');
        });

        onitBlock.doc = stringify(onitDoc);

        // Parser for onitChapter
        // The chapter is a string who must match something from the current onitdocumentation.config file, property 'chapters'
        const onitChapter = block.tags.find(t => t.tag === 'onitChapter');
        if (onitChapter) {
            onitBlock.chapter = onitChapter.name;
        } else {
            return;
        }

        // Parser for title. NOTE: This title is this page title, does not ends up into jekill.
        const onitTitle = block.tags.find(t => t.tag === 'onitTitle');
        if (onitTitle) {
            if (['h2', 'h3', 'h4'].includes(onitTitle.name)) {
                onitBlock.title = onitTitle.description;
                onitBlock.titleFormat = onitTitle.name;
            } else {
                onitBlock.title = onitTitle.name + ' ' + onitTitle.description;
            }
        }

        // Parser for onitPriority. Just for internal sorting purposes
        const onitPriority = block.tags.find(t => t.tag === 'onitPriority');
        if (onitPriority && onitPriority.name) {
            onitBlock.priority = priorityConverter(onitPriority.name);
        } else {
            onitBlock.priority = 10000;
        }

        const params = block.tags.filter(b => b.tag === 'param');
        onitBlock.params = onitBlock.params || [];
        onitBlock.params.push(...params);

        blocks.chapters[onitBlock.chapter] = blocks.chapters[onitBlock.chapter] || [];
        blocks.chapters[onitBlock.chapter].push(onitBlock);
    });

    return blocks;
};
