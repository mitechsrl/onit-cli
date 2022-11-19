"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownCommentParser = void 0;
const TypescriptCommentParser_1 = require("./TypescriptCommentParser");
const fs_1 = __importDefault(require("fs"));
const types_1 = require("./types");
class MarkdownCommentParser extends types_1.CommentParser {
    constructor() {
        super();
        // uses internally some methods of TypescriptCommentParser.
        // Mainly the method that parse a comment text block
        // NOTE: Comment text blocks are strings that start with '/**' and ends with '*/'
        this.typescriptCommentParser = new TypescriptCommentParser_1.TypescriptCommentParser();
    }
    parseFiles(files) {
        const blocks = [];
        for (const file of files) {
            // this just fakes a comment text block and passes it to typescript parser
            // For markdown, the entire file is faked as comment text block
            const fileContent = `/**\n${fs_1.default.readFileSync(file).toString()}\n*/`;
            // parse the comment text block.
            const block = this.typescriptCommentParser.parseCommentText(fileContent, file);
            if (block) {
                blocks.push(block);
            }
        }
        return blocks;
    }
}
exports.MarkdownCommentParser = MarkdownCommentParser;
//# sourceMappingURL=MarkdownCommentParser.js.map