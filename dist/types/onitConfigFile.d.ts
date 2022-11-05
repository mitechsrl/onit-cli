import { GenericObject } from '.';
export declare type OnitConfigFileServeOnFirstTscCompilationSuccess = {
    name?: string;
    cmd?: string;
    cwd?: string;
};
export declare type OnitConfigFileServe = {
    version?: string;
    params?: string[];
    environment?: GenericObject;
    componentsScanDirs?: string[];
    componentsPaths?: string[];
    main?: string;
    nodeArgs?: string[];
    onFirstTscCompilationSuccess?: OnitConfigFileServeOnFirstTscCompilationSuccess[];
    'pm2-dev-ecosystem'?: GenericObject;
};
export declare type OnitConfigFileTestTarget = OnitConfigFileServe & {
    grep?: string;
    key?: string;
    launchOnit?: boolean;
    startup?: string;
    beforeTest?: string;
    shutdown?: string;
    testFilesDirectories?: string[];
};
export declare type OnitConfigFileLink = {
    link: string;
    target?: string;
};
export declare type OnitConfigFileCopyFile = {
    to?: string;
    from?: string;
    glob?: string[];
};
export declare type OnitConfigFile = {
    json: {
        component?: boolean;
        copyFiles?: OnitConfigFileCopyFile;
        reactPaths?: string[];
        webpackEntryPointPaths?: string[];
        link?: OnitConfigFileLink[];
        serve?: OnitConfigFileServe;
        test?: {
            [k: string]: OnitConfigFileTestTarget;
        };
    };
    sources: string[];
    fileNameWithoutExt: string;
};
