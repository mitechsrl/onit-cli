import { GenericObject } from '.';

export type OnitConfigFileServeOnFirstTscCompilationSuccess = {
    // name of subprocess
    name?: string,
    //command to be run with spawn
    cmd?: string,
    // cwd for spawn. Defaults to process.cwd
    cwd?: string  
};

export type OnitConfigFileServe = {
    // serve version
    version?:string,
    // optional hsrdcode params
    params?: string[],
    // key-value items to be injected in process.env
    environment?: GenericObject,
    // list of directories to be scanned for components
    componentsScanDirs?: string[],
    // list of paths to be loaded as components
    componentsPaths?: string[],
    // main js to be launched on serve
    main?:string,
    // custom node spawn params
    nodeArgs?: string[],
    // commands to be run on first tsc compilation success
    onFirstTscCompilationSuccess?: OnitConfigFileServeOnFirstTscCompilationSuccess[],
    // pm2 ecosystem config to be launched before serving
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'pm2-dev-ecosystem'?: GenericObject
};

export type OnitConfigFileTestTarget = OnitConfigFileServe & {
    // yargs grep 
    grep?:string,
    key?: string,
    // launch onit for test. Defaults to true
    launchOnit?:boolean,
    // Run at test startup. Run before launching onit eventually
    startup?: string,
    // run just before running the tests. Run after startup and after launching onit eventually
    beforeTest?:string,
    //shutdown script. Run after test completion
    shutdown?:string,
    // array of directorues to scan for test files
    testFilesDirectories?:string[]
};

export type OnitConfigFileLink = {
    link: string,
    target?: string
};

export type OnitConfigFileCopyFile = {
    to?: string,
    from?:string,
    glob?:string[]
};
export type OnitConfigFile = {

    json: {
        // is this a onit component?
        component?: boolean,
        // copy files after tsc
        copyFiles?: OnitConfigFileCopyFile,

        //optional entry point search paths
        reactPaths?:string[]
        webpackEntryPointPaths?:string[];

        // link config
        link?: OnitConfigFileLink[],
        // serve config
        serve?: OnitConfigFileServe,
        // test config
        test?: { [k:string]: OnitConfigFileTestTarget }
    },
    sources: string[]
    fileNameWithoutExt: string
};