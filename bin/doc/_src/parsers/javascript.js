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
