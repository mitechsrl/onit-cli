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
exports.TypescriptCommentParser = void 0;
const tsdoc_1 = require("@microsoft/tsdoc");
const tsutils_1 = require("tsutils");
const typescript_1 = __importDefault(require("typescript"));
class TypescriptCommentParser {
    constructor() {
        const config = new tsdoc_1.TSDocConfiguration();
        const customTags = ['@chapter', '@title', '@summary', '@priority'];
        customTags.forEach(tagString => {
            const tag = new tsdoc_1.TSDocTagDefinition({
                tagName: tagString,
                syntaxKind: tsdoc_1.TSDocTagSyntaxKind.BlockTag
            });
            config.addTagDefinition(tag);
            config.setSupportForTag(tag, true);
        });
        this.tsdocParser = new tsdoc_1.TSDocParser(config);
    }
    renderDocNode(docNode) {
        let result = '';
        if (docNode) {
            if (docNode instanceof tsdoc_1.DocExcerpt) {
                result += docNode.content.toString();
            }
            for (const childNode of docNode.getChildNodes()) {
                result += this.renderDocNode(childNode);
            }
        }
        return result;
    }
    renderDocNodes(docNodes) {
        let result = '';
        for (const docNode of docNodes) {
            result += this.renderDocNode(docNode);
        }
        return result;
    }
    parseCommentText(commentText, filename) {
        const parserContext = this.tsdocParser.parseString(commentText);
        const docComment = parserContext.docComment;
        const block = {
            title: '',
            summary: [],
            chapter: '',
            params: [],
            returns: '',
            remarks: '',
            privateRemarks: '',
            see: [],
            throws: [],
            example: [],
            priority: 0,
            beta: docComment.modifierTagSet.isBeta(),
            alpha: docComment.modifierTagSet.isAlpha(),
            deprecated: '',
            virtual: docComment.modifierTagSet.isVirtual(),
            override: docComment.modifierTagSet.isOverride(),
            remarksBlock: '',
            __filename: filename
        };
        if (docComment.remarksBlock) {
            block.remarksBlock = this.renderDocNode(docComment.remarksBlock.content).trim();
        }
        if (docComment.privateRemarks) {
            block.privateRemarks = this.renderDocNode(docComment.privateRemarks.content).trim();
        }
        // @ts-expect-error property
        for (const throwsBlock of docComment.getChildNodes().filter(n => (n.blockTag || {}).tagName === '@throws')) {
            // @ts-expect-error property
            block.throws.push(this.renderDocNode(throwsBlock.content).trim());
        }
        // @ts-expect-error property
        for (const priorityBlock of docComment.getChildNodes().filter(n => (n.blockTag || {}).tagName === '@priority')) {
            // @ts-expect-error property
            block.priority = parseInt(this.renderDocNode(priorityBlock.content).trim());
        }
        // @ts-expect-error property
        for (const exampleBlock of docComment.getChildNodes().filter(n => (n.blockTag || {}).tagName === '@example')) {
            // @ts-expect-error property
            block.example.push(this.renderDocNode(exampleBlock.content).trim());
        }
        for (const seeBlock of docComment.seeBlocks) {
            block.see.push(this.renderDocNode(seeBlock.content).trim());
        }
        if (docComment.deprecatedBlock) {
            block.deprecated = this.renderDocNode(docComment.deprecatedBlock.content).trim();
        }
        for (const customBlock of docComment.customBlocks) {
            switch (customBlock.blockTag.tagName) {
                case '@summary':
                    block.summary.push(this.renderDocNode(customBlock.content).trim());
                    break;
                case '@title':
                    block.title = this.renderDocNode(customBlock.content).trim();
                    break;
                case '@chapter':
                    block.chapter = this.renderDocNode(customBlock.content).trim();
                    break;
            }
        }
        if (docComment.summarySection) {
            block.summary.push(this.renderDocNode(docComment.summarySection).trim());
        }
        for (const paramBlock of docComment.params.blocks) {
            block.params.push({
                name: paramBlock.parameterName,
                description: this.renderDocNode(paramBlock.content).trim()
            });
        }
        if (docComment.returnsBlock) {
            block.returns = this.renderDocNode(docComment.returnsBlock.content).trim();
        }
        block.summary = [block.summary.join('\n')];
        if (block.summary && block.chapter) {
            return block;
        }
        return null;
    }
    parseFile(files) {
        const program = typescript_1.default.createProgram(files, {
            target: typescript_1.default.ScriptTarget.ES2018
        });
        const blocks = [];
        for (const file of files) {
            const sourceFile = program.getSourceFile(file);
            if (!sourceFile) {
                throw new Error('Error retrieving source file');
            }
            // https://tsdoc.org/pages/tags
            (0, tsutils_1.forEachComment)(sourceFile, (text, comment) => {
                if (comment.kind === typescript_1.default.SyntaxKind.MultiLineCommentTrivia) {
                    const commentText = text.substring(comment.pos, comment.end);
                    const block = this.parseCommentText(commentText, file);
                    if (block) {
                        blocks.push(block);
                    }
                }
            });
        }
        return blocks;
    }
}
exports.TypescriptCommentParser = TypescriptCommentParser;
//# sourceMappingURL=TypescriptCommentParser.js.map