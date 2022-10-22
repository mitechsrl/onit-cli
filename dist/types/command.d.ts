import yargs from 'yargs';
export declare type CommandExecFunction = (argv: yargs.ArgumentsCamelCase<{}>) => void;
export declare type Command = {
    description: string;
    longHelp?: string;
    params: {
        name: string;
        config: yargs.Options;
    }[];
    exec: string;
    strictCommands?: boolean;
};
