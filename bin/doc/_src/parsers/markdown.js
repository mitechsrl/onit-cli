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

module.exports.parse = (fileContent, blocks) => {
    /* @onitTitle Database Initialization
    * @onitChapter 1.0.1.1
    * @onitDoc
    */

    // TODO: onitType

    const onitTitleLength = '@onitTitle'.length;
    const onitDocLength = '@onitDoc'.length;
    let startFrom = 0;
    while (true) {
        const onitBlock = {
            type: '',
            params: [],
            title: '',
            doc: '',
            chapter: ''
        };

        const onitTitlePos = fileContent.indexOf('@onitTitle', startFrom);
        if (onitTitlePos < 0) {
            break;
        };

        // search for end
        let end = fileContent.indexOf('@onitTitle', onitTitlePos + onitTitleLength);
        // not found, use the end of file
        if (end < 0) end = fileContent.length;

        // section start from @OnitTitle and ends to
        // - next @OnitTitle
        // - end of file
        const section = fileContent.substr(onitTitlePos, end - onitTitlePos);
        const titleMatch = section.match(/^[^@]*@onitTitle +(.+)$/mi);
        onitBlock.title = (titleMatch ? titleMatch[1] : '').trim();
        if (!onitBlock.title) {
            break;
        }

        // extract chapter
        const onitChapterMatcher = section.match(/^[^\n\ra-z@]*@onitChapter +(.+)$/mi);
        onitBlock.chapter = (onitChapterMatcher ? onitChapterMatcher[1] : '').trim();
        if (!onitBlock.chapter) {
            break;
        }

        // extract priority
        const onitPriorityMatcher = section.match(/^[^\n\ra-z@]*@onitPriority +(.+)$/mi);
        onitBlock.priority = parseInt((onitPriorityMatcher ? onitPriorityMatcher[1] : '1000').trim());

        // extract doc
        const docStart = section.indexOf('@onitDoc');
        if (docStart < 0) {
            break;
        }
        onitBlock.doc = section.substr(docStart + onitDocLength).trim();

        // append to the previous blocks
        blocks.chapters[onitBlock.chapter] = blocks.chapters[onitBlock.chapter] || [];
        blocks.chapters[onitBlock.chapter].push(onitBlock);

        startFrom = onitTitlePos + onitTitleLength;
    }

    return blocks;
};
