"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownCommentParser = void 0;
const TypescriptCommentParser_1 = require("./TypescriptCommentParser");
const fs_1 = __importDefault(require("fs"));
class MarkdownCommentParser {
    constructor() {
        // uses internally some methods of TypescriptCommentParser.
        // Mainly the method that parse a comment text block
        // NOTE: Comment text blocks are strings that start with '/**' and ends with '*/'
        this.typescriptCommentParser = new TypescriptCommentParser_1.TypescriptCommentParser();
    }
    parseFile(files) {
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