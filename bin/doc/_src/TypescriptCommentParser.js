const { TSDocParser, DocExcerpt, TSDocConfiguration, TSDocTagSyntaxKind, TSDocTagDefinition } = require('@microsoft/tsdoc');
const { forEachComment } = require('tsutils');
const ts = require('typescript');

class TypescriptCommentParser {
    constructor () {
        const config = new TSDocConfiguration();

        const customTags = ['@chapter', '@title', '@summary', '@priority'];
        customTags.forEach(tagString => {
            const tag = new TSDocTagDefinition({
                tagName: tagString,
                syntaxKind: TSDocTagSyntaxKind.BlockTag
            });
            config.addTagDefinition(tag);
            config.setSupportForTag(tag, true);
        });
        /*
        const tag2 = new TSDocTagDefinition({
            tagName: '@title',
            syntaxKind: TSDocTagSyntaxKind.BlockTag
        });
        config.addTagDefinition(tag2);
        config.setSupportForTag(tag2, true);

        const tag3 = new TSDocTagDefinition({
            tagName: '@summary',
            syntaxKind: TSDocTagSyntaxKind.BlockTag
        });
        config.addTagDefinition(tag3);
        config.setSupportForTag(tag3, true);

        const tag3 = new TSDocTagDefinition({
            tagName: '@summary',
            syntaxKind: TSDocTagSyntaxKind.BlockTag
        });
        config.addTagDefinition(tag3);
        config.setSupportForTag(tag3, true);
*/
        this.tsdocParser = new TSDocParser(config);
    }

    renderDocNode (docNode) {
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

    renderDocNodes (docNodes) {
        let result = '';
        for (const docNode of docNodes) {
            result += this.renderDocNode(docNode);
        }
        return result;
    }

    parseCommentText (commentText, filename) {
        const parserContext = this.tsdocParser.parseString(commentText);
        const docComment = parserContext.docComment;

        const block = {
            title: '',
            summary: [],
            chapter: '',
            params: [],
            return: '',
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
            __filename: filename
        };

        if (docComment.remarksBlock) {
            block.remarksBlock = this.renderDocNode(docComment.remarksBlock.content).trim();
        }

        if (docComment.privateRemarks) {
            block.privateRemarks = this.renderDocNode(docComment.privateRemarks.content).trim();
        }

        for (const throwsBlock of docComment.getChildNodes().filter(n => (n.blockTag || {}).tagName === '@throws')) {
            block.throws.push(this.renderDocNode(throwsBlock.content).trim());
        }

        for (const priorityBlock of docComment.getChildNodes().filter(n => (n.blockTag || {}).tagName === '@priority')) {
            block.priority = parseInt(this.renderDocNode(priorityBlock.content).trim());
        }
        for (const exampleBlock of docComment.getChildNodes().filter(n => (n.blockTag || {}).tagName === '@example')) {
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
            block.return = this.renderDocNode(docComment.returnsBlock.content).trim();
        }

        block.summary = block.summary.join('\n');

        if (block.title && block.summary && block.chapter) {
            return block;
        }

        return null;
    }

    parseFile (files) {
        const program = ts.createProgram(files, {
            target: ts.ScriptTarget.ES2018
        });

        const blocks = [];

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
exports.TypescriptCommentParser = TypescriptCommentParser;
