import { OnitDocumentationConfigFileJson } from '../../../types';
import { DocumentationBlock } from './types';
export declare class DocBuilder {
    private configFile;
    private outDir;
    private blocks;
    private scanTargetDir;
    private automaticLinksLabels;
    private writeCallbacks;
    constructor(configFile: OnitDocumentationConfigFileJson, scanTargetDir: string, blocks: DocumentationBlock[], outDir: string);
    /**
     * Build an internal array of "string pieces" to be matched in the comments to be converted automatically to links.
     *
     * @param chapters
     * @returns
     */
    private generateAutomaticLinksLabels;
    private generateBlockContentString;
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
    private resolveSourceIncludes;
    /**
     * Create the string content of the file for the current chapterConfig
     * @param {*} chapterConfig
     * @returns The file content
     */
    private buildChapterFileContent;
    private reduceJekillHeader;
    private createFinalFileContent;
    /**
     *
     * @param {*} chapters
     * @param {*} parent
     * @param {*} grandparent
     */
    private recurseBuildChapterFiles;
    /**
     * Process a string and resolve image links.
     * Links follow the stndard markdown config: https://www.markdownguide.org/basic-syntax/#images
     *
     * Images are copy&pasted into dst directory and comment links updated to the new path
     *
     * @param {*} sourceString The string to be processsed for links
     * @returns The string with processed links
     */
    private resolveImageLink;
    /**
     * Convert array which represent a path in filename
     * @param {*} chapterPath
     * @returns
     */
    private chapterPathToMarkdownFilename;
    private chapterCache;
    /**
     *
     * @param {*} chapters
     * @param {*} chapter
     * @param {*} path
     * @returns
     */
    private findChapterPath;
    /**
     * Split a string for code tags.
     *
     * example
     *    "comment1\n```code```\ncomment2"
     * will be splitted in
     *   ["comment2", "```code```", "comment2"]
     *
     * This make easier to detect code blocks because they will start and end with ```.
     * NOTE: this is a simple split, it can be broken by malformed tags.
     *       Each time a ``` is detected it will be managed accordingly as open or close tag
     * @param str
     * @returns array of stirngs.
     */
    private splitCodeTags;
    /**
     * convert any piece of text to link accordingly to the chapter labels and titles
     * This will make easier to navigate between chapters sinche every recognized text will be a link to his
     * chapter without need to manually add a link to it.
     *
     * @param sourceString
     * @returns The parsed string
     */
    private generateAutomaticLinks;
    /**
     * Resolve the @link tags to create a hyperlink to the destination page
     *
     * @param {*} sourceString The text to be parsed
     * @param {*} chapterDepth
     * @returns
     */
    private resolveInternalLink;
    /**
     * Prebuild file outputs in memory
     */
    build(): void;
    /**
     * Write out data. This basically call all the writeCallbacks.
     */
    write(): void;
}
