import { GenericObject } from '.';

export type OnitConfigFileTestTarget = {
    
    grep?:string,
    key?: string
    
};
export type OnitConfigFile = {

    json: {
        link: { link:string }[],
        test: { [k:string]: OnitConfigFileTestTarget }
    },
    sources: string[]
    fileNameWithoutExt: string
};