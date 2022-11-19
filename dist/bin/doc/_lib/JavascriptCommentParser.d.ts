import { CommentParser, DocumentationBlock } from './types';
export declare class JavascriptCommentParser extends CommentParser {
    private typescriptCommentParser;
    constructor();
    parseFiles(files: string[]): DocumentationBlock[];
}
