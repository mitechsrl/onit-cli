import { GenericObject } from '.';
export type OnitConfigFileServeOnFirstTscCompilationSuccess = {
    name?: string;
    cmd?: string;
    cwd?: string;
};
export type OnitConfigFileServe = {
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
export type OnitConfigFileTestTarget = OnitConfigFileServe & {
    grep?: string;
    key?: string;
    launchOnit?: boolean;
    startup?: string;
    beforeTest?: string;
    shutdown?: string;
    testFilesDirectories?: string[];
};
export type OnitConfigFileLink = {
    link: string;
    target?: string;
};
export type OnitConfigFileCopyFile = {
    to?: string;
    from?: string;
    glob?: string[];
};
export type OnitConfigFileBuildExtraStep = {
    name?: string;
    cwd?: string;
    cmd?: string | string[];
};
export type OnitConfigFileBuildTarget = {
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
export type OnitConfigFileBuild = {
    version?: string;
    targets?: {
        [k: string]: OnitConfigFileBuildTarget;
    };
};
export type OnitConfigFile = {
    json: {
        component?: boolean;
        copyFiles?: OnitConfigFileCopyFile;
        reactPaths?: string[];
        webpackEntryPointPaths?: string[];
        link?: OnitConfigFileLink[];
        serve?: OnitConfigFileServe;
        build?: OnitConfigFileBuild;
        test?: {
            [k: string]: OnitConfigFileTestTarget;
        };
    };
    sources: string[];
    fileNameWithoutExt: string;
};
