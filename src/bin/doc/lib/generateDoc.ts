import { GenericObject, OnitDocumentationConfigFileJson } from '../../../types';
import { DocBuilder } from './DocBuilder';
import { findFiles } from './findFiles';
import { MarkdownCommentParser } from './MarkdownCommentParser';
import { TypescriptCommentParser } from './TypescriptCommentParser';

/**
 *
 * @param {*} configFile
 * @param {*} outDir
 */
export async function generateDoc (config: OnitDocumentationConfigFileJson, outDir: string) {
    // const scanTargetDir = process.cwd();
    const scanTargetDir = 'C:\\progetti\\onit-base-workspace\\onit-next';

    const parsers: GenericObject = {
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
    }, {} as GenericObject);

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

