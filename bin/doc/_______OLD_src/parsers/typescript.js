const { TSDocParser } = require('@microsoft/tsdoc');
const { parse, stringify } = require('comment-parser');
const typescript = require('typescript');

module.exports.parse = (fileContent, filePath, blocks) => {
    const commentBlocks = parse(fileContent);

    commentBlocks.forEach(block => {
        console.log(block);
    });
    /*
    const tsdocParser = new TSDocParser();
    const parserContext = tsdocParser.parseString(fileContent);

    console.log(parserContext.tokens); */
    return blocks;
};
