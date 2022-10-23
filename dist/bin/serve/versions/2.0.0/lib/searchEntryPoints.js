"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchEntryPoints = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const find_1 = __importDefault(require("find"));
/**
 * Scan the dev environment to find for webpack.json files.
 * These ones in our env keep data of entry points.
 * These data is then merged into one single bigger webpack config json
 *
 */
function searchEntryPoints(context, searchSubDirs) {
    // search in these subdirs of the provided one.
    searchSubDirs = ['./src/client', ...searchSubDirs || []];
    // search for webpack entry points: files from context/config.path/.../react/webpack.json
    const entryPoints = {};
    const regex = /[\\/]webpack\.json$/;
    const files = searchSubDirs.reduce((files, subdir) => {
        subdir = path_1.default.resolve(context, subdir);
        if (fs_1.default.existsSync(subdir)) {
            files.push(...find_1.default.fileSync(regex, subdir));
        }
        return files;
    }, []);
    files.forEach(f => {
        const file = JSON.parse(fs_1.default.readFileSync(f).toString());
        Object.keys(file.entry || {}).forEach(epKey => {
            const id = epKey;
            const name = path_1.default.resolve(path_1.default.dirname(f), file.entry[epKey]);
            entryPoints[id] = name;
        });
    });
    return entryPoints;
}
exports.searchEntryPoints = searchEntryPoints;
//# sourceMappingURL=searchEntryPoints.js.map