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

import { GenericObject, OnitDocumentationConfigFileJson } from '../../../types';
import { DocBuilder } from './DocBuilder';
import { findFiles } from './findFiles';
import { JavascriptJSXCommentParser } from './JavascriptJSXCommentParser';
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
        markdown: new MarkdownCommentParser(),
        'jsx-javascript': new JavascriptJSXCommentParser()
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
        blocks.push(...parsers[parser].parseFiles(groupByParser[parser]));
    }

    const docBuilder = new DocBuilder(config, scanTargetDir, blocks, outDir);
    docBuilder.build();
    docBuilder.write();

}

