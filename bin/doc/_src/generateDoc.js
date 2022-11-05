const { TypescriptCommentParser } = require('./TypescriptCommentParser');
const { findFiles } = require('./findFiles');
const { MarkdownCommentParser } = require('./MarkdownCommentParser');
const { DocBuilder } = require('./DocBuilder');

/**
 *
 * @param {*} configFile
 * @param {*} outDir
 */
async function generateDoc (config, outDir) {
    // const scanTargetDir = process.cwd();
    const scanTargetDir = 'C:\\progetti\\onit-base-workspace\\onit-next';

    const parsers = {
        typescript: new TypescriptCommentParser(),
        markdown: new MarkdownCommentParser()
    };
    const blocks = [];

    // Scan for files
    const files = await findFiles(config, scanTargetDir);

    // group files by parser. Typescript parsing is more efficient
    // by parsing once all the file instead parsing every single file separately
    const groupByParser = files.reduce((acc, f) => {
        acc[f.parser] = acc[f.parser] || [];
        acc[f.parser].push(f.file);
        return acc;
    }, {});
    // Run the parser
    for (const parser of Object.keys(groupByParser)) {
        blocks.push(...parsers[parser].parseFile(groupByParser[parser]));
    }

    // console.log('Copying images...');
    // copyImages(config, blocks, scanTargetDir, outDir);

    const docBuilder = new DocBuilder(config, scanTargetDir, blocks, outDir);
    docBuilder.build();
    docBuilder.write();
}

module.exports.generateDoc = generateDoc;
