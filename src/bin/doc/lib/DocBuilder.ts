
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import crypto from 'crypto';
import { GenericObject, OnitDocumentationConfigFileChapter, OnitDocumentationConfigFileJson, StringError } from '../../../types';
import { DocumentationBlock } from './types';
import { logger } from '../../../lib/logger';

export class DocBuilder {

    private configFile: OnitDocumentationConfigFileJson;
    private outDir: string;
    private blocks: DocumentationBlock[];
    private scanTargetDir: string;
    private automaticLinksLabels: { labels: string[], chapter: string }[] = [];

    // keep the callbacks for writing out data. THis allow us to precalculate everything and write them out 
    // only at the end of the process
    private writeCallbacks: (()=> void)[] = [];

    constructor(configFile: OnitDocumentationConfigFileJson, scanTargetDir:string, blocks: DocumentationBlock[] , outDir:string) {
        this.configFile = configFile;
        this.blocks = blocks;
        this.outDir = outDir;
        this.scanTargetDir = scanTargetDir;

        // set indexes based on position in config file so we can sort the chapters later
        const _recurseSetIndex = (tree:OnitDocumentationConfigFileChapter[] ) => {
            tree.forEach((t, i) => {
                t.chapterIndexNumber = i;
                if (t.children) {
                    _recurseSetIndex(t.children);
                }
            });
        };
        
        _recurseSetIndex(configFile.chapters ?? []);

        if (configFile.chapters){
            this.automaticLinksLabels = this.generateAutomaticLinksLabels(configFile.chapters);
        }
    }

    /**
     * Build an internal array of "string pieces" to be matched in the comments to be converted automatically to links.
     * 
     * @param chapters 
     * @returns 
     */
    private generateAutomaticLinksLabels(chapters: OnitDocumentationConfigFileChapter[]){
        const result: { labels: string[], chapter: string }[] = [];

        chapters.forEach(chapter => {
            if (!chapter.chapter) return;
            if (!chapter.title) return;
            
            result.push({
                chapter: chapter.chapter,
                labels: [chapter.chapter, chapter.title]
            });
            if (chapter.children){
                const subLabels = this.generateAutomaticLinksLabels(chapter.children);
                result.push(...subLabels);
            }
        });
        return result;
    }
    
    private generateBlockContentString(block: DocumentationBlock, defaultTitle:string) {
        let str = '';

        // title is by default h1. If the user add one ort more #, we're keeping that value for sizing.
        if (block.title) {
            if (!block.title.startsWith('#')) {
                str += '# ';
            }
            str += (block.title || defaultTitle) + '\n\n';
        }

        str += block.summary + '\n\n';

        if (block.params.length > 0) {
            str += '#### Params\n';
        }

        block.params.forEach(param => {
            str += '**' + param.name + '**\n';
            str += param.description;
            str += '\n\n';
        });

        if (block.returns) {
            str += '#### Returns\n';
            str += block.returns;
            str += '\n\n';
        }

        const chapterPath = this.findChapterPath(this.configFile.chapters ?? [], block.chapter, []);
        if (!chapterPath) throw new StringError('Cannot find chapterPath');
        const chapterDepth = chapterPath.length;

        // resolve @src source include tags
        str = this.resolveSourceIncludes(str, block.__filename);
                
        // 
        str = this.generateAutomaticLinks(str);

        // resolve the internal links for better navigation
        str = this.resolveInternalLink(str, chapterDepth);

        // Resolve image links 
        str = this.resolveImageLink(str, block.__filename, chapterDepth);

        return str;
    }

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
    private resolveSourceIncludes(str:string, blockSourceFile: string) {
        // resolve reference links
        // [@src filename_relative_path transformFunction]
        const regex = /\[@src +([^ \]]+) *([^ \]]+)? *(.*)?\]/gm;
        let m;

        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            const found = m[0]; // all the matched piece of code
            let file = m[1]; // file path relative to blockSourceFile to be included
            let transformFunction = m[2]; // apply this function to the text before adding to the docs
            const params = m[3]; // apply this function to the text before adding to the docs

            if (!file.startsWith('.')) {
                file = '.' + path.sep + file;
            }

            file = path.join(path.dirname(blockSourceFile), file);
            if (!fs.existsSync(file)) {
                logger.warn('@src file resolution error: file ' + file + ' not found in ' + blockSourceFile);
                continue;
            }
            let replace = '';

            const fileContent = fs.readFileSync(file).toString();
            if (!transformFunction) {
                transformFunction = 'includeFullFile';
            }
            
            const transformFunctionPath = path.join(__dirname, './includeTransforms/', './' + transformFunction);
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const fn = require(transformFunctionPath);
                // this is needed to support class-style includeTransforms
                if (typeof fn.default === 'function'){
                    const processor = new fn.default();
                    replace = processor.parse(fileContent, file, params);
                }
            } catch (e) {
                logger.warn('Transform of ' + found + ' failed, error:' + e);
            }

            str = str.replace(found, replace);
        }
        return str;
    }

    /**
     * Create the string content of the file for the current chapterConfig
     * @param {*} chapterConfig 
     * @returns The file content
     */
    private buildChapterFileContent(chapterConfig: OnitDocumentationConfigFileChapter) {
        const blocksByChapter = this.blocks.filter(b => b.chapter === chapterConfig.chapter);
        // add extracted blocks markdown
        if (blocksByChapter.length > 0) {
            const defaultTitle = chapterConfig.title ?? '';
            // sort them
            blocksByChapter.sort((a, b) => a.priority - b.priority);
            // merge all the blocks for this chapter into a "mega arkdown text"
            return blocksByChapter.map(block => this.generateBlockContentString(block, defaultTitle)).join('\n\n');
        }

        return '';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private reduceJekillHeader(acc: string, e: any) {
        if (typeof e === 'string') acc = acc + '\n' + e;
        if (Array.isArray(e)) acc = acc + '\n' + e[0] + ': ' + e[1];
        return acc.trim();
    }

    private createFinalFileContent(header: GenericObject, content = '') {
        const jekillHeader = [
            '---',
            ['layout', 'page'],
            ...Object.entries(header || {}),
            '---'
        ].reduce(this.reduceJekillHeader, '');

        return jekillHeader + content;
    }

    /**
     * 
     * @param {*} chapters 
     * @param {*} parent 
     * @param {*} grandparent 
     */
    private recurseBuildChapterFiles(chapters: OnitDocumentationConfigFileChapter[], parent?: OnitDocumentationConfigFileChapter, grandparent?: OnitDocumentationConfigFileChapter) {
        chapters.forEach(chapterConfig => {

            // calculate the destination directory
            const fileDir = path.join(
                this.outDir,
                this.chapterPathToMarkdownFilename([
                    grandparent || {} as OnitDocumentationConfigFileChapter,
                    parent || {} as OnitDocumentationConfigFileChapter,
                    chapterConfig
                ])
            );

            // ensure the directory exists
            this.writeCallbacks.push(
                () => fs.mkdirSync(fileDir, { recursive: true })
            );

            // automatically add index in case of "children chapters"
            if ((chapterConfig.children || []).length > 0) {
                chapterConfig.index = chapterConfig.index || {};
                chapterConfig.index.has_children = 'true';
            }

            // this chapter defines a index configuration. Add the 'index.md' file
            if (chapterConfig.index) {
                chapterConfig.index.title = chapterConfig.title;

                // setup hierarchy references
                if (parent) chapterConfig.index.parent = parent.title;
                if (grandparent) chapterConfig.index.grand_parent = grandparent.title;

                // create the index content
                // FIXME: trasporta buildContent
                const chapterFileContent = this.buildChapterFileContent(chapterConfig);

                // write the file out
                const headerData: GenericObject = chapterConfig.index || {};
                headerData.nav_order = chapterConfig.chapterIndexNumber;
                const finalFileContent = this.createFinalFileContent(headerData, '\n\n\n' + chapterFileContent);
                
                const fileFullPath = path.join(fileDir, 'index.md');
                logger.log('Generating content of '+fileFullPath);
                this.writeCallbacks.push(
                    () => fs.writeFileSync(fileFullPath, finalFileContent)
                );
            }

            // do not add page content for indexes
            if (!chapterConfig.index) {
                // automatically add a page if we have some blocks for it
                const blocksByChapter = this.blocks.filter(b => b.chapter === chapterConfig.chapter);
                if (blocksByChapter.length > 0) {
                    chapterConfig.page = chapterConfig.page || {};
                }

                // create the page config
                if (chapterConfig.page) {
                    chapterConfig.page.title = chapterConfig.title;

                    // setup hierarchy references
                    if (parent) chapterConfig.page.parent = parent.title;
                    if (grandparent) chapterConfig.page.grand_parent = grandparent.title;

                    // create the page content
                    // FIXME: trasporta buildContent
                    const generatedFileContent = this.buildChapterFileContent(chapterConfig);

                    // h4 must not appear on file toc
                    const regex = /^(####.+)$/gm;
                    const subst = '$1\n{: .no_toc}\n';

                    const chapterFileContent = '1. TOC\n{:toc}\n---\n' + generatedFileContent.replace(regex, subst);

                    // write the file out
                    const fileFullPath = path.join(fileDir, chapterConfig.title?.replace(/[^a-zA-Z0-9]/g, '-') + '.md');
                    const headerData:GenericObject = chapterConfig.page || {};
                    headerData.nav_order = chapterConfig.chapterIndexNumber;

                    const finalFileContent = this.createFinalFileContent(headerData, '\n\n\n' + chapterFileContent);
                    logger.log('Generating content of '+fileFullPath);
                    this.writeCallbacks.push(
                        () => fs.writeFileSync(fileFullPath, finalFileContent)
                    );
                }
            }

            // recurse on children
            if (chapterConfig.children) {
                this.recurseBuildChapterFiles(chapterConfig.children, chapterConfig, parent);
            }
        });
    }

    /**
     * Process a string and resolve image links.
     * Links follow the stndard markdown config: https://www.markdownguide.org/basic-syntax/#images
     * 
     * Images are copy&pasted into dst directory and comment links updated to the new path
     * 
     * @param {*} sourceString The string to be processsed for links 
     * @returns The string with processed links
     */
    private resolveImageLink(sourceString: string, blockSourceFile:string, chapterDepth:number) {

        // match for ![text](link)
        const regex = /!\[([^\]]+)\]\(([^)]+)\)/gm;

        let m;
        while ((m = regex.exec(sourceString)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            const found = m[0];
            const text = m[1];
            const srcFilename = path.join(path.dirname(blockSourceFile), m[2]);
            const ext = path.extname(srcFilename);
            const dstPath = path.join(this.outDir, './images/');
            const hashDstFilename = crypto.createHash('md5').update(srcFilename).digest('hex') + ext;
            const dstFilename = path.join(dstPath, hashDstFilename);

            // FIXME: questo url è hardcodato, non va bene. Occorre calcolarlo a partire da srcPath (con ../ etc)
            const markdownDst = [
                ...Array(chapterDepth).fill('..'),
                path.join('images/', hashDstFilename)
            ].join(path.sep);
            const replace = '![' + text + '](' + markdownDst + ')';
            sourceString = sourceString.replace(found, replace);

            this.writeCallbacks.push(() => {
                if (fs.existsSync(srcFilename)) {
                    if (!fs.existsSync(dstPath)) {
                        fs.mkdirSync(dstPath, { recursive: true });
                    }
                    fs.copyFileSync(srcFilename, dstFilename);
                } else {
                    logger.warn('Image ' + srcFilename + ' not found in ' + blockSourceFile);
                }
            });
        }
        return sourceString;
    }

    /**
     * Convert array which represent a path in filename
     * @param {*} chapterPath 
     * @returns 
     */
    private chapterPathToMarkdownFilename(chapterPath: OnitDocumentationConfigFileChapter[]) {
        return chapterPath.map(p => p.chapter).filter(p => !!p).join(path.sep);
    }

    private chapterCache: GenericObject = {};
    /**
     * 
     * @param {*} chapters 
     * @param {*} chapter 
     * @param {*} path 
     * @returns 
     */
    private findChapterPath(chapters : OnitDocumentationConfigFileChapter[], chapter: string , path: OnitDocumentationConfigFileChapter[] = [], matchFn: ((c: OnitDocumentationConfigFileChapter) => boolean) | null = null): OnitDocumentationConfigFileChapter[]|null {
        
        if (matchFn === null)
            matchFn = c => c.chapter === chapter;

        const cacheKey = chapter+matchFn.toString();
        if (this.chapterCache[cacheKey]) return this.chapterCache[cacheKey];

        const c = chapters.find(matchFn);
        if (c) return [...path, c];

        for (const _chapter of chapters) {
            if (_chapter.children) {
                const r = this.findChapterPath(_chapter.children, chapter, [...path, _chapter], matchFn);
                this.chapterCache[cacheKey] = r;
                if (r) return r;
            }
        }
        return null;
    }

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
    private splitCodeTags(str:string){
        let isCode = false;
        const pieces = [];
        let currentPiece = '';
        const chars = str.split('');
        const isCodeTag = (index:number) => {
            return chars[index]+chars[index+1]+chars[index+2] === '```'; 
        };
    
        for (let i = 0 ;i<chars.length; i++){
            if (isCodeTag(i)){
                if (!isCode) {
                    pieces.push(currentPiece);
                    currentPiece = '```';
                    i+=2;
                }else{
                    currentPiece += '```';
                    pieces.push(currentPiece);
                    currentPiece = '';
                    i+=2;
                }
                isCode = !isCode;
            }else{
                currentPiece+=chars[i];
            }
        }
        pieces.push(currentPiece);
        return pieces.filter(p => !!p);
    }

    /**
     * convert any piece of text to link accordingly to the chapter labels and titles
     * This will make easier to navigate between chapters sinche every recognized text will be a link to his
     * chapter without need to manually add a link to it.
     * 
     * @param sourceString 
     * @returns The parsed string
     */
    private generateAutomaticLinks(sourceString: string){
        
        const codeBlockMatch = /^```.+```$/gms;

        // split the string in subpieces.
        // these pieces will be either standard comment (strings which does not stats and ends with ```)
        // or code blocks (starting and ending with ```)
        // Code blocks will be skipped from substitution. We don't want to change source code!
        const pieces = this.splitCodeTags(sourceString).map(piece => {
            if (piece.match(codeBlockMatch)) return piece;

            this.automaticLinksLabels.forEach(l => {
                l.labels.forEach(label => {
                    const regexs = [
                        // entire line match exactly label
                        { regex: new RegExp('^'+label+'$', 'g'), replace: `[@link ${l.chapter}](${label})` },
                        { regex: new RegExp('^'+label+'\n', 'g'), replace: `[@link ${l.chapter}](${label})\n` },
                        // line ends with label and label has space before (but not on titles)
                        { regex: new RegExp('([^#]+ +)'+label+'$', 'g'), replace: `$1[@link ${l.chapter}](${label})` },
                        { regex: new RegExp('([^#]+ +)'+label+'\n', 'g'), replace: `$1[@link ${l.chapter}](${label})\n` },
                        // label is surronded by spaces (but not if is a title)
                        { regex: new RegExp('([^#]+ +)'+label+'( +)', 'g'), replace: `$1[@link ${l.chapter}](${label})$2` },
                        // line starts with label and has spaces after
                        { regex: new RegExp('^'+label+'( +)', 'g'), replace: `[@link ${l.chapter}](${label})$1` },
                        { regex: new RegExp('\n'+label+'( +)', 'g'), replace: `\n[@link ${l.chapter}](${label})$1` },
                    ];
                    
                    regexs.forEach(r => {
                        piece = piece.replace(r.regex, r.replace);
                    });
                });
            });
           
            return piece;
        });
        
        return pieces.join('');
    }

    /**
     * Resolve the @link tags to create a hyperlink to the destination page
     * 
     * @param {*} sourceString The text to be parsed
     * @param {*} chapterDepth 
     * @returns 
     */
    private resolveInternalLink(sourceString: string, chapterDepth:number) {
        // resolve reference links
        // this matches one from
        // [@link LABEL#Info](for more info)
        // [@link LABEL](for more info)
        // [@link LABEL#Info] 
        // [@link LABEL] 
        const regex = /\[@link +([a-zA-Z0-9_-]+)(#[^\]]+)?\](\(([^)]+)\))?/gm;
        let m;

        while ((m = regex.exec(sourceString)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            const found = m[0]; // all the matched piece of code
            const chapter = m[1]; // chapter
            const anchor = m[2] || ''; // anchor
            let text = m[4] || ''; // link text.

            // match both on chapter and title to make easier creating links
            const matchFn = (c:OnitDocumentationConfigFileChapter) => c.chapter === chapter || c.title === chapter;

            const linkChapterPath = this.findChapterPath(this.configFile.chapters ?? [], chapter, [], matchFn);
            if (!linkChapterPath || linkChapterPath.length === 0) {
                logger.warn('Link generation for ' + found + ' failed. Nothing found for the specified label.');
                continue;
            }

            let linkChapterFilename = null;
            if (!linkChapterPath[linkChapterPath.length - 1].children) {
                const referenceTitle = (linkChapterPath[linkChapterPath.length - 1].title || '').replace(/ /g, '-');
                linkChapterFilename = [
                    ...Array(chapterDepth).fill('..'),
                    this.chapterPathToMarkdownFilename(linkChapterPath),
                    referenceTitle + '.html' + anchor
                ].join(path.sep);
            } else {
                linkChapterFilename = [
                    ...Array(chapterDepth).fill('..'),
                    this.chapterPathToMarkdownFilename(linkChapterPath) + anchor,
                ].join(path.sep);
            }

            if (!text) text = linkChapterPath[linkChapterPath.length - 1].title ?? '';

            const replace = '[' + text + '](' + linkChapterFilename + ')';
            sourceString = sourceString.replace(found, replace);
        }
        return sourceString;
    }

    /**
     * Prebuild file outputs in memory
     */
    public build() {
        // empty write callbacks. This 
        this.writeCallbacks = [];

        // Do nothing special, just check and warn about unknown chapters
        this.blocks.forEach(block => {
            const chapterPath = this.findChapterPath(this.configFile.chapters ?? [], block.chapter, []);
            if (!chapterPath) {
                logger.warn('Unknown chapter ' + block.chapter + ' in ' + block.__filename);
            }
        });

        logger.log('Building output files...');
        this.recurseBuildChapterFiles(this.configFile.chapters??[]);
    }

    /**
     * Write out data. This basically call all the writeCallbacks.
     */
    public write() {

        // Ensure we have the target dir empty
        fse.removeSync(this.outDir);

        fs.mkdirSync(this.outDir, { recursive: true });

        // effectively run the fs-related stuff
        for (const cb of this.writeCallbacks) {
            cb();
        }
    }
}

exports.DocBuilder = DocBuilder;