export type ScanCommandResult = {
    cmd: string;
    file: string;
    children: ScanCommandResult[];
};
/**
 * Scan the passed in directory searching for commandConfig.js files.
 *
 * @param dir
 * @param name
 * @returns A deep json with command paths and some infos
 */
export declare function scanCommands(dir: string, name: string): Promise<ScanCommandResult[]>;
