import { DocNode } from '@microsoft/tsdoc';
import { CommentParser, DocumentationBlock } from './types';
export declare class TypescriptCommentParser extends CommentParser {
    private tsdocParser;
    constructor();
    renderDocNode(docNode: DocNode): string;
    renderDocNodes(docNodes: DocNode[]): string;
    parseCommentText(commentText: string, filename: string): DocumentationBlock | null;
    parseFiles(files: string[]): DocumentationBlock[];
}
