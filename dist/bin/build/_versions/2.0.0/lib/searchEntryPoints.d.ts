/**
 * Scan the dev environment to find for webpack.json files.
 * These ones in our env keep data of entry points.
 * These data is then merged into one single bigger webpack config json
 *
 */
export declare function searchEntryPoints(context: string, searchSubDirs?: string[]): {
    [k: string]: string;
};
