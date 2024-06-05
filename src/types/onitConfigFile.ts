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
    // serve version. Optional, if omited <parent>.version is checked 
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
    'pm2-dev-ecosystem'?: GenericObject,
    // Enable or disable a preemptive check of potential conflicting @mitech packages versions.
    // Does not affect serve, only prints warnings. Default enabled.
    checkPackageLockPotentialConflicts?: boolean
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

export type OnitConfigFileBuildExtraStep = {
    name?:string, 
    cwd?:string,
    cmd?: string|string[] 
};

export type OnitConfigFileBuildTarget = {
    key?:string,
    mode?:string,
    version?: {
        propose?:boolean,
        additional?: {
            name?: string,
            cmd?: string
        }
    },
    beforeSteps?:OnitConfigFileBuildExtraStep[],
    afterSteps?:OnitConfigFileBuildExtraStep[]
};
export type OnitConfigFileBuild = {
    // serve version. Optional, if omited <parent>.version is checked 
    version?:string,
    targets?: { [k:string]:OnitConfigFileBuildTarget }
};

export type OnitConfigFileTranslate = {
    // these strings (entire label text) are skipped
    skip?: string[],
    synomns?: { word: string, syn:string }[],
    // array of languages for translations.
    // languages must follow format en_GB, fr_FR, it_IT etc...
    languages?:string[]
};

// defines the frontend engines. The generic object values as true-is, but you can use it to configure
// options for the engine (not now, set it for future uses). In nextjs as example you can add the "next directory" property (to be managed in the proper file)
export type OnitConfigFileEngineFrontend = { [k in 'onit-webpack' | 'nextjs' ]?: boolean | GenericObject };

// defines the frontend engines. The generic object values as true-is, but you can use it to configure
// options for the engine 
export type OnitConfigFileEngineBackend = { [k in 'lb4']?: boolean | GenericObject };

export type OnitConfigFileEngine = {
    frontend?: false | OnitConfigFileEngineFrontend,
    backend?: OnitConfigFileEngineBackend

};

export type OnitConfigFile = {

    json: {
        // serve&build version. Optional, if omitted '*' is used
        version?:string,

        // is this a onit component?
        component?: boolean,
        // copy files after tsc
        copyFiles?: OnitConfigFileCopyFile,

        //optional entry point search paths
        reactPaths?:string[]
        webpackEntryPointPaths?:string[];
        // defines which engines are used in the project. Defaults to 'lb4' for backend, 'onit-webpack' for frontend
        engines?: OnitConfigFileEngine;
        // link config
        link?: OnitConfigFileLink[],
        // serve config
        serve?: OnitConfigFileServe,
        // build config
        build?: OnitConfigFileBuild, 
        // test config
        test?: { [k:string]: OnitConfigFileTestTarget },
        // translate config
        translate?: OnitConfigFileTranslate,
        
    },
    sources: string[]
    fileNameWithoutExt: string
};