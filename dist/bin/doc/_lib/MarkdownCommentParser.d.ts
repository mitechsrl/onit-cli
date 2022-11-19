import { CommentParser } from './types';
export declare class MarkdownCommentParser extends CommentParser {
    private typescriptCommentParser;
    constructor();
    parseFiles(files: string[]): import("./types").DocumentationBlock[];
}
