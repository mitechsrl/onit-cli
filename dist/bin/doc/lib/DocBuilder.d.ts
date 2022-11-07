import { GenericObject, OnitDocumentationConfigFileChapter, OnitDocumentationConfigFileJson } from '../../../types';
import { DocumentationBlock } from './TypescriptCommentParser';
export declare class DocBuilder {
    private configFile;
    private outDir;
    private blocks;
    private scanTargetDir;
    private writeCallbacks;
    constructor(configFile: OnitDocumentationConfigFileJson, scanTargetDir: string, blocks: DocumentationBlock[], outDir: string);
    generateBlockContentString(block: DocumentationBlock, defaultTitle: string): string;
    /**
     * Teplace the [@src filePath transformFunction] with the content of filepath.
     * The content can be processed usingransformfunction, whichcan extract any useful info from the filePath
     * source file.
     * See ./transformFunctions for usabe values (includeFullFile, lb4Model, lb4Repository)
     * If transformFunction is omitted, the entire file is included (transformFunction=includeFullFile)
     * @param {*} str the string to be processed
     * @param {*} blockSourceFile block source file
     * @returns
     */
    resolveSourceIncludes(str: string, blockSourceFile: string): string;
    /**
     * Create the string content of the file for the current chapterConfig
     * @param {*} chapterConfig
     * @returns The file content
     */
    buildChapterFileContent(chapterConfig: OnitDocumentationConfigFileChapter): string;
    reduceJekillHeader(acc: string, e: any): string;
    createFinalFileContent(header: GenericObject, content?: string): string;
    /**
     *
     * @param {*} chapters
     * @param {*} parent
     * @param {*} grandparent
     */
    recurseBuildChapterFiles(chapters: OnitDocumentationConfigFileChapter[], parent?: OnitDocumentationConfigFileChapter, grandparent?: OnitDocumentationConfigFileChapter): void;
    /**
     * Process a string and resolve image links.
     * Links follow the stndard markdown config: https://www.markdownguide.org/basic-syntax/#images
     *
     * Images are copy&pasted into dst directory and comment links updated to the new path
     *
     * @param {*} sourceString The string to be processsed for links
     * @returns The string with processed links
     */
    resolveImageLink(sourceString: string, blockSourceFile: string, chapterDepth: number): string;
    /**
     * Convert array which represent a path in filename
     * @param {*} chapterPath
     * @returns
     */
    chapterPathToMarkdownFilename(chapterPath: OnitDocumentationConfigFileChapter[]): string;
    /**
     *
     * @param {*} chapters
     * @param {*} chapter
     * @param {*} path
     * @returns
     */
    findChapterPath(chapters: OnitDocumentationConfigFileChapter[], chapter: string, path?: OnitDocumentationConfigFileChapter[], matchFn?: ((c: OnitDocumentationConfigFileChapter) => boolean) | null): OnitDocumentationConfigFileChapter[] | null;
    /**
     *
     * @param {*} sourceString
     * @param {*} chapterDepth
     * @returns
     */
    resolveInternalLink(sourceString: string, chapterDepth: number): string;
    /**
     * Prebuild file outputs in memory
     */
    build(): void;
    /**
     * Write out data. This basically call all the writeCallbacks.
     */
    write(): void;
}
