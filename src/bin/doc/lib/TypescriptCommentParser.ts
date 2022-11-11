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

import { TSDocParser, DocExcerpt, TSDocConfiguration, TSDocTagSyntaxKind, TSDocTagDefinition, DocNode } from '@microsoft/tsdoc';
import { forEachComment } from 'tsutils';
import ts from 'typescript';
import { CommentParser, DocumentationBlock } from './types';

export class TypescriptCommentParser extends CommentParser {

    private tsdocParser: TSDocParser;
    constructor () {
        super();
        const config = new TSDocConfiguration();

        const customTags = ['@chapter', '@title', '@summary', '@priority','@prop'];
        customTags.forEach(tagString => {
            const tag = new TSDocTagDefinition({
                tagName: tagString,
                syntaxKind: TSDocTagSyntaxKind.BlockTag
            });
            config.addTagDefinition(tag);
            config.setSupportForTag(tag, true);
        });
        
        this.tsdocParser = new TSDocParser(config);
    }

    renderDocNode (docNode:DocNode) {
        let result = '';
        if (docNode) {
            if (docNode instanceof DocExcerpt) {
                result += docNode.content.toString();
            }
            for (const childNode of docNode.getChildNodes()) {
                result += this.renderDocNode(childNode);
            }
        }
        return result;
    }

    renderDocNodes (docNodes: DocNode[]) {
        let result = '';
        for (const docNode of docNodes) {
            result += this.renderDocNode(docNode);
        }
        return result;
    }

    parseCommentText (commentText:string, filename:string): DocumentationBlock|null {
        const parserContext = this.tsdocParser.parseString(commentText);
        const docComment = parserContext.docComment;

        const block: DocumentationBlock = {
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
            priority: 1000,
            beta: docComment.modifierTagSet.isBeta(),
            alpha: docComment.modifierTagSet.isAlpha(),
            deprecated: '',
            virtual: docComment.modifierTagSet.isVirtual(),
            override: docComment.modifierTagSet.isOverride(),
            remarksBlock:'',
            props: [],
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
            case '@summary': block.summary.push(this.renderDocNode(customBlock.content).trim());
                break;
            case '@title': block.title = this.renderDocNode(customBlock.content).trim();
                break;
            case '@chapter': block.chapter = this.renderDocNode(customBlock.content).trim();
                break;
            case '@prop': {
                const content = this.renderDocNode(customBlock.content).trim().replace(/\n/gm,' \n').split(' ');
                const p = {
                    name: (content[0] ?? '').trim(),
                    description: content.slice(1).join(' ').trim()
                };
                if(p.name) block.props.push(p);
                break;
            }
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
    
    parseFiles (files:string[]) {
        const program = ts.createProgram(files, {
            target: ts.ScriptTarget.ES2018
        });

        const blocks: DocumentationBlock[] = [];

        for (const file of files) {
            const sourceFile = program.getSourceFile(file);
            if (!sourceFile) {
                throw new Error('Error retrieving source file');
            }

            // https://tsdoc.org/pages/tags
            forEachComment(sourceFile, (text, comment) => {
                if (comment.kind === ts.SyntaxKind.MultiLineCommentTrivia) {
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
