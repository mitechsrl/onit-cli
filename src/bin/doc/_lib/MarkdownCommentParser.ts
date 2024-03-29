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

import { TypescriptCommentParser } from './TypescriptCommentParser';
import fs from 'fs';
import { CommentParser } from './types';

export class MarkdownCommentParser extends CommentParser {

    private typescriptCommentParser: TypescriptCommentParser;
    
    constructor() {
        super();
        // uses internally some methods of TypescriptCommentParser.
        // Mainly the method that parse a comment text block
        // NOTE: Comment text blocks are strings that start with '/**' and ends with '*/'
        this.typescriptCommentParser = new TypescriptCommentParser();
    }

    parseFiles(files: string[]) {

        const blocks = [];
        for (const file of files) {
            // this just fakes a comment text block and passes it to typescript parser
            // For markdown, the entire file is faked as comment text block
            const fileContent = `/**\n${fs.readFileSync(file).toString()}\n*/`;

            // parse the comment text block.
            const block = this.typescriptCommentParser.parseCommentText(fileContent, file);
            if (block) {
                blocks.push(block);
            }
        }
        return blocks;
    }
}
