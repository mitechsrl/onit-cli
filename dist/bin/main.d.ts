import yargs from 'yargs';
export declare const cli: yargs.Argv<{
    h: unknown;
} & {
    verbose: boolean | undefined;
} & {
    "log-to-file": boolean | undefined;
}>;
