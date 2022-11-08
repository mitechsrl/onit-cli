/**
 * Process a repository TS file and produces a markdown document
 */
import ts from 'typescript';
import yargs from 'yargs';
export declare type TsClassCommon = {
    name: string;
    title?: string;
    chapter?: string;
    see?: string[];
    throws?: string[];
    deprecated?: string[];
    decorators: {
        name: string;
        params: string[];
    }[];
    comment: string[];
};
export declare type TsClassMemberCommon = {
    public: boolean;
    private: boolean;
    protected: boolean;
    static: boolean;
    async: boolean;
} & TsClassCommon;
export declare type TsClassMemberProperty = {
    type: string;
} & TsClassMemberCommon;
export declare type TsClassMemberMethod = {
    params: {
        name: string;
        type: string;
        comment: string;
    }[];
    returnComment: string;
    returnType: string;
} & TsClassMemberCommon;
export declare type TsClass = {
    properties: TsClassMemberProperty[];
    methods: TsClassMemberMethod[];
    chapter: string;
} & TsClassCommon;
/**
 * Parse a generic typescript class
 */
export default class GenericClassFileParser {
    classes: TsClass[];
    /**
     * Convert a property object to markdown
     *
     * @param {*} property
     * @returns Array of markdown lines
     */
    renderPropertyMarkdown(property: TsClassMemberProperty): string[];
    /**
     *
     * @param {*} method
     * @returns
     */
    renderMethodMarkdownAfterTitle(method: TsClassMemberMethod): string[];
    /**
     * Convert a method object to markdown
     * @param {*} method
     * @returns Array of markdown lines
     */
    renderMethodMarkdown(method: TsClassMemberMethod): string[];
    /**
     * Render repository markdown
     *
     * @returns Array of markdown lines
     */
    renderMarkdown(): string[];
    /**
     * Process the passed-in src file andproduces a markdown output
     *
     * @param {*} src The source file content
     * @param {*} filename The source filename
     * @param {*} params
     * @returns the built markdown string
     */
    parse(src: string, filename: string, argv: yargs.ArgumentsCamelCase<unknown>): string;
    /**
     * Process the current AST node and extract modifiers
     * @param {*} obj descriptor object
     * @param {*} n current AST node
     * @return the populated descripor object
     */
    processModifiers<T extends TsClassMemberCommon>(obj: T, n: ts.Node): T;
    /**
     * Process the current AST node and extract decorators
     * @param {*} obj  descriptor object
     * @param {*} n  current AST node
     * @return the populated descripor object
     */
    processDecorators<T extends TsClassCommon>(obj: T, src: string, n: ts.Node): T;
    /**
     * Process a method declaration node
     *
     * @param {*} src the source file content
     * @param {*} n Current ast node
     * @returns A object describing this property
     */
    processMethodDeclaration(src: string, n: ts.Node): TsClassMemberMethod;
    /**
     * Process a property declaration node
     *
     * @param {*} src the source file content
     * @param {*} n Current property AST node
     * @returns
     */
    processProperty(src: string, n: ts.Node): TsClassMemberProperty;
    /**
     * Process some basic jsdoc properties
     *
     * @param {*} obj descriptor object
     * @param {*} src the source file content
     * @param {*} n Current property AST node
     * @return the populated descripor object
     */
    processJSDoc<T extends TsClassCommon>(obj: T, src: string, n: ts.Node): T;
    /**
     * Parse the passed-in src to extract the file info
     *
     * @param {*} src
     */
    extractInfo(src: string): void;
}
