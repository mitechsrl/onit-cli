const fs = require('fs');
const path = require('path');

/**
 * Generate a block markdown
 *
 * @param {*} block
 * @returns
 */
const generateBlock = (block) => {
    let str = '## ' + block.title + '\n\n';
    str += block.doc + '\n\n';

    if (block.params.length > 0) {
        str += '### Params\n';
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
        if (chapterName) chapterName = '-' + chapterName;
        const file = path.join(outDir, chapterKey + chapterName + '.md');

        const chapterFileContent = blocks.chapters[chapterKey].map(block => generateBlock(block)).join('\n\n');
        fs.writeFileSync(file, chapterFileContent);
    });
};

module.exports = {
    writeFile: writeFile
};
