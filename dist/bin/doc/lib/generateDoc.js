"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDoc = void 0;
const DocBuilder_1 = require("./DocBuilder");
const findFiles_1 = require("./findFiles");
const MarkdownCommentParser_1 = require("./MarkdownCommentParser");
const TypescriptCommentParser_1 = require("./TypescriptCommentParser");
/**
 *
 * @param {*} configFile
 * @param {*} outDir
 */
async function generateDoc(config, outDir) {
    // const scanTargetDir = process.cwd();
    const scanTargetDir = 'C:\\progetti\\onit-base-workspace\\onit-next';
    const parsers = {
        typescript: new TypescriptCommentParser_1.TypescriptCommentParser(),
        markdown: new MarkdownCommentParser_1.MarkdownCommentParser()
    };
    const blocks = [];
    // Scan for files
    const files = await (0, findFiles_1.findFiles)(config, scanTargetDir);
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
    const docBuilder = new DocBuilder_1.DocBuilder(config, scanTargetDir, blocks, outDir);
    docBuilder.build();
    docBuilder.write();
}
exports.generateDoc = generateDoc;
//# sourceMappingURL=generateDoc.js.map