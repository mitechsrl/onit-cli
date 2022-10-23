import fs from 'fs';
import path from 'path';
import find from 'find';

/**
 * Scan the dev environment to find for webpack.json files.
 * These ones in our env keep data of entry points.
 * These data is then merged into one single bigger webpack config json
 *
 */
export function searchEntryPoints(context: string, searchSubDirs?: string[]){
    // search in these subdirs of the provided one.
    searchSubDirs = ['./src/client', ...searchSubDirs || []];

    // search for webpack entry points: files from context/config.path/.../react/webpack.json
    const entryPoints: { [k:string] : string }= {};
    
    const regex = /[\\/]webpack\.json$/;

    const files: string[] = searchSubDirs.reduce((files, subdir) => {
        subdir = path.resolve(context, subdir);
        if (fs.existsSync(subdir)) {
            files.push(...find.fileSync(regex, subdir));
        }
        return files;
    }, [] as string[]);

    files.forEach(f => {
        const file = JSON.parse(fs.readFileSync(f).toString());
        Object.keys(file.entry || {}).forEach(epKey => {
            const id = epKey;
            const name = path.resolve(path.dirname(f), file.entry[epKey]);
            entryPoints[id] = name;
        });
    });

    return entryPoints;
}

