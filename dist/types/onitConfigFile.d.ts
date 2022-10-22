export declare type OnitConfigFileTestTarget = {
    grep?: string;
    key?: string;
};
export declare type OnitConfigFile = {
    json: {
        link: {
            link: string;
        }[];
        test: {
            [k: string]: OnitConfigFileTestTarget;
        };
    };
    sources: string[];
    fileNameWithoutExt: string;
};
