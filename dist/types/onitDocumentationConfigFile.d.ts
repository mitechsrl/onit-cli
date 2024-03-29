export declare type OnitDocumentationConfigFileChapter = {
    chapter?: string;
    title?: string;
    index?: {
        [k: string]: string | undefined;
    };
    page?: {
        [k: string]: string | undefined;
    };
    children?: OnitDocumentationConfigFileChapter[];
    chapterIndexNumber: number;
};
export declare type OnitDocumentationConfigFileJson = {
    baseUrl?: string;
    ignore?: string[];
    globList?: {
        extension: string;
        glob: string[];
        parser: 'markdown' | 'typescript';
    }[];
    chapters?: OnitDocumentationConfigFileChapter[];
};
export declare type OnitDocumentationConfigFile = {
    sources: string[];
    json: OnitDocumentationConfigFileJson;
};
