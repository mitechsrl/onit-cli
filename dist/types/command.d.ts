import yargs from 'yargs';
export type CommandExecFunction = (argv: yargs.ArgumentsCamelCase<unknown>) => void;
export type Command = {
    description: string;
    longHelp?: string;
    params: {
        name: string;
        config: yargs.Options;
    }[];
    exec: string;
    strictCommands?: boolean;
    strictOptions?: boolean;
};
