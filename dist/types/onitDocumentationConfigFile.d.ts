export type OnitDocumentationConfigFileChapter = {
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
export type OnitDocumentationConfigFileJson = {
    baseUrl?: string;
    ignore?: string[];
    globList?: {
        extension: string;
        glob: string[];
        parser: 'markdown' | 'typescript';
    }[];
    chapters?: OnitDocumentationConfigFileChapter[];
};
export type OnitDocumentationConfigFile = {
    sources: string[];
    json: OnitDocumentationConfigFileJson;
};
