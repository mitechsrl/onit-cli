export declare type DocumentationBlock = {
    title: string;
    summary: string[];
    chapter: string;
    params: {
        name: string;
        description: string;
    }[];
    returns: string;
    remarks: string;
    privateRemarks: string;
    see: string[];
    throws: string[];
    example: string[];
    priority: number;
    beta: boolean;
    alpha: boolean;
    deprecated: string;
    virtual: boolean;
    override: boolean;
    remarksBlock: string;
    __filename: string;
};
export declare abstract class CommentParser {
    abstract parseFiles(files: string[]): DocumentationBlock[];
}
