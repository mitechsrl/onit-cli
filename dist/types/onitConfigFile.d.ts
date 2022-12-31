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
export declare type OnitConfigFileBuildExtraStep = {
    name?: string;
    cwd?: string;
    cmd?: string | string[];
};
export declare type OnitConfigFileBuildTarget = {
    key?: string;
    mode?: string;
    version?: {
        propose?: boolean;
        additional?: {
            name?: string;
            cmd?: string;
        };
    };
    beforeSteps?: OnitConfigFileBuildExtraStep[];
    afterSteps?: OnitConfigFileBuildExtraStep[];
};
export declare type OnitConfigFileBuild = {
    version?: string;
    targets?: {
        [k: string]: OnitConfigFileBuildTarget;
    };
};
export declare type OnitConfigFileTranslate = {
    skip?: string[];
    synomns?: {
        word: string;
        syn: string;
    }[];
    languages?: string[];
};
export declare type OnitConfigFileEngineFrontend = {
    [k in 'onit-webpack' | 'nextjs']?: boolean | GenericObject;
};
export declare type OnitConfigFileEngineBackend = {
    [k in 'lb4']?: boolean | GenericObject;
};
export declare type OnitConfigFileEngine = {
    frontend?: OnitConfigFileEngineFrontend;
    backend?: OnitConfigFileEngineBackend;
};
export declare type OnitConfigFile = {
    json: {
        component?: boolean;
        copyFiles?: OnitConfigFileCopyFile;
        reactPaths?: string[];
        webpackEntryPointPaths?: string[];
        engines?: OnitConfigFileEngine;
        link?: OnitConfigFileLink[];
        serve?: OnitConfigFileServe;
        build?: OnitConfigFileBuild;
        test?: {
            [k: string]: OnitConfigFileTestTarget;
        };
        translate?: OnitConfigFileTranslate;
    };
    sources: string[];
    fileNameWithoutExt: string;
};
