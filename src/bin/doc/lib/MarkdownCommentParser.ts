import { TypescriptCommentParser } from './TypescriptCommentParser';
import fs from 'fs';

export class MarkdownCommentParser {

    private typescriptCommentParser: TypescriptCommentParser;
    
    constructor() {
        // uses internally some methods of TypescriptCommentParser.
        // Mainly the method that parse a comment text block
        // NOTE: Comment text blocks are strings that start with '/**' and ends with '*/'
        this.typescriptCommentParser = new TypescriptCommentParser();
    }

    parseFile(files: string[]) {

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
