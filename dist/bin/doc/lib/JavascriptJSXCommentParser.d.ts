import { CommentParser, DocumentationBlock } from './types';
export declare class JavascriptJSXCommentParser extends CommentParser {
    private typescriptCommentParser;
    constructor();
    parseFiles(files: string[]): DocumentationBlock[];
}
