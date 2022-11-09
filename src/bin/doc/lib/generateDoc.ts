import { GenericObject, OnitDocumentationConfigFileJson } from '../../../types';
import { DocBuilder } from './DocBuilder';
import { findFiles } from './findFiles';
import { MarkdownCommentParser } from './MarkdownCommentParser';
import { TypescriptCommentParser } from './TypescriptCommentParser';

/**
 * Scan  and generate the doc files at the specified path 
 * 
 * @param config Documentation config file
 * @param scanTargetDir Dierectory to be scanned for comments
 * @param outDir The final markdown oututt directory
 *  
 */
export async function generateDoc (config: OnitDocumentationConfigFileJson, scanTargetDir: string, outDir: string) {
   
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

    const docBuilder = new DocBuilder(config, scanTargetDir, blocks, outDir);
    docBuilder.build();
    docBuilder.write();

}

