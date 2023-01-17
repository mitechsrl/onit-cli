/**
 * Scan a directory which is supposed to contain multiple versions of the same subprogram,
 * then load the version which match the provided requiredVersion constraint.
 *
 * The directory (myDir) is supposed to contain a structure like:
 * - myDir
 *   - 1.0.0
 *     - index.ts
 *   - 2.0.0
 *     - index.ts
 *   - 2.1.0
 *     - index.ts
 * The loader will use semver to select the best match for he provided requiredVersion
 * (which must follow semver constraint format) then load the relative index.ts file and return it.
 *
 * @param versionsDir a directory path
 * @param requiredVersion A semver version constraint (^1.2.3, ~1.5.0 or anything like this)
 * @returns A object {required: any, version:string} where required is the loaded script (one of the index.ts files)
 * and version is the version of the loaded script which best matched the requiredVersion param
 *
 */
export declare function loadVersionDir(versionsDir: string, requiredVersion: string, name: string): {
    required: any;
    version: string;
};
