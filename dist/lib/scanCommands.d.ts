export type ScanCommandResult = {
    cmd: string;
    file: string;
    children: ScanCommandResult[];
};
/**
 * Recursively scan the passed in directory searching for commandConfig.js files.
 *
 * @param dir The directory to be scanned
 * @param name The command name. This is an arbitrary string but it should match the directory name
 * @returns A deep json with command paths and some infos
 */
export declare function scanCommands(dir: string, name: string): Promise<ScanCommandResult[]>;
