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

const { priorityConverter } = require('../lib/priority');

module.exports.parse = (fileContent, filePath, blocks) => {
    const onitBlock = {
        filePath: filePath,
        type: '',
        params: [],
        title: '',
        doc: '',
        chapter: '',
        returns: null
    };

    const onitDocLength = '@onitDoc'.length;

    const onitDocIndex = fileContent.indexOf('@onitDoc');
    if (onitDocIndex < 0) {
        return blocks;
    }
    onitBlock.doc = fileContent.substr(onitDocIndex + onitDocLength).trim();

    // extract chapter
    const onitChapterMatcher = fileContent.match(/^[^\n\ra-z@]*@onitChapter +(.+)$/mi);
    if (!onitChapterMatcher) {
        return blocks;
    }
    onitBlock.chapter = onitChapterMatcher[1].trim();

    // extract title
    const titleMatch = fileContent.match(/^[^@]*@onitTitle +(.+)[\r\n]+$/mi);
    if (titleMatch) {
        const split = titleMatch[1].trim().split(' ');
        if (split[0].trim() && ['h2', 'h3', 'h4'].includes(split[0].trim())) {
            onitBlock.titleFormat = split[0].trim();
            onitBlock.title = split.slice(1).join(' ');
        } else {
            onitBlock.title = titleMatch[1].trim();
        }
    } else {
        onitBlock.title = '';
    }


    // extract priority
    const onitPriorityMatcher = fileContent.match(/^[^\n\ra-z@]*@onitPriority +(.+)$/mi);
    if (onitPriorityMatcher) {
        onitBlock.priority = priorityConverter(onitPriorityMatcher[1].trim());
    } else {
        onitBlock.priority = 10000;
    }

    // append to the previous blocks
    blocks.chapters[onitBlock.chapter] = blocks.chapters[onitBlock.chapter] || [];
    blocks.chapters[onitBlock.chapter].push(onitBlock);

    return blocks;
};
