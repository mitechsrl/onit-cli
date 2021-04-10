module.exports.parse = (fileContent, blocks) => {
    /* @onitTitle Database Initialization
    * @onitChapter 1.0.1.1
    * @onitDoc
    */

    // TODO: onitType

    const onitTitleLength = '@onitTitle'.length;
    const onitDocLength = '@onitDoc'.length;
    var startFrom = 0;
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
            console.log('EXIT title 1');
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
            console.log('EXIT title');
            break;
        }

        // extract chapter
        const onitChapterMatcher = section.match(/^[^\n\ra-z@]*@onitChapter +(.+)$/mi);
        onitBlock.chapter = (onitChapterMatcher ? onitChapterMatcher[1] : '').trim();
        if (!onitBlock.chapter) {
            console.log('EXIT chapter');
            break;
        }

        // extract priority
        const onitPriorityMatcher = section.match(/^[^\n\ra-z@]*@onitPriority +(.+)$/mi);
        onitBlock.priority = parseInt((onitPriorityMatcher ? onitPriorityMatcher[1] : '1000').trim());

        // extract doc
        const docStart = section.indexOf('@onitDoc');
        if (docStart < 0) {
            console.log('EXIT docStart');
            break;
        }
        onitBlock.doc = section.substr(docStart + onitDocLength).trim();

        console.log("MARKDWON", onitBlock.priority);

        // append to the previous blocks
        blocks.chapters[onitBlock.chapter] = blocks.chapters[onitBlock.chapter] || [];
        blocks.chapters[onitBlock.chapter].push(onitBlock);

        startFrom = onitTitlePos + onitTitleLength;
    }

    return blocks;
};
