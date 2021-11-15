const path = require('path');
const fs = require('fs');
const find = require('find');


/**
 * Scan the dev environment to find for webpack.json files.
 * These ones in our env keep data of entry points.
 * These data is then merged into one single bigger webpack config json
 *
 */
const searchEntryPoints = (context, searchSubDirs) => {
    // search in these subdirs of the provided one.
    searchSubDirs = ['./src/client', ...searchSubDirs || []];

    // search for webpack entry points: files from context/config.path/.../react/webpack.json
    const entryPoints = {};
    const regex = /[\\/]webpack\.json$/;

    const files = searchSubDirs.reduce((files, subdir) => {
        subdir = path.resolve(context, subdir);
        if (fs.existsSync(subdir)) {
            files.push(...find.fileSync(regex, subdir));
        }
        return files;
    }, []);

    files.forEach(f => {
        const file = require(f);
        Object.keys(file.entry || {}).forEach(epKey => {
            const id = epKey;
            const name = path.resolve(path.dirname(f), file.entry[epKey]);
            entryPoints[id] = name;
        });
    });

    return entryPoints;
};

module.exports.searchEntryPoints = searchEntryPoints;
