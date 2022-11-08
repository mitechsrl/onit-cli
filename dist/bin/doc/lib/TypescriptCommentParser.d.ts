import { DocNode } from '@microsoft/tsdoc';
import { DocumentationBlock } from './types';
export declare class TypescriptCommentParser {
    private tsdocParser;
    constructor();
    renderDocNode(docNode: DocNode): string;
    renderDocNodes(docNodes: DocNode[]): string;
    parseCommentText(commentText: string, filename: string): DocumentationBlock | null;
    parseFile(files: string[]): DocumentationBlock[];
}
