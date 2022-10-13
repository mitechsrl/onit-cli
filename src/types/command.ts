import yargs from 'yargs';

export type CommandExecFunction = (argv: yargs.ArgumentsCamelCase<{}>) => void;

export type Command = {
    // short description
    description: string,

    // long help to be displayed on single command -h usage
    longHelp?: string,
    
    params: {
        name: string,
        config: yargs.Options
    }[],
    // path to file exporting the CommandExecFunction to be run.
    // That file must export it as default.
    exec: string,

    // allow unknown positional parameters
    // If true, "mitech pm2 demo" will be managed by "mitech pm2" since everything after "pm2" is unknown 
    strictCommands?: boolean
};
