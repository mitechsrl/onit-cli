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
