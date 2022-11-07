export declare class MarkdownCommentParser {
    private typescriptCommentParser;
    constructor();
    parseFile(files: string[]): import("./TypescriptCommentParser").DocumentationBlock[];
}
