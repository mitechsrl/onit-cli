import yargs from 'yargs';
export declare const cli: yargs.Argv<{
    h: unknown;
} & {
    verbose: boolean | undefined;
} & {
    nerd: unknown;
} & {
    "log-to-file": boolean | undefined;
} & {
    "experimental-network-inspection": boolean | undefined;
}>;
