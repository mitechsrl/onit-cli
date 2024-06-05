"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertPackageLockPotentialConflicts = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../../../lib/logger");
/**
 * Prints potential conflicts by checking if "@mitech/..."" packages are installed in different versions
 * in the package-lock.json
 *
 * @param onitConfigFile
 */
async function assertPackageLockPotentialConflicts(onitConfigFile) {
    var _a;
    // Where to search for the package-lock.json
    const searchPaths = [
        process.cwd(),
        path_1.default.join(process.cwd(), '../'),
        ...onitConfigFile.sources.map(s => path_1.default.dirname(s)),
        ...onitConfigFile.sources.map(s => path_1.default.join(path_1.default.dirname(s), '../')) // parent dir of the onit config file, probably for workspaces
    ];
    const file = searchPaths.find(p => fs_1.default.existsSync(path_1.default.join(p, 'package-lock.json')));
    // Should not happen, but in case no check is applied
    if (!file)
        return;
    const packageLockJsonFilePath = path_1.default.join(file, 'package-lock.json');
    const packageLockJson = JSON.parse(fs_1.default.readFileSync(packageLockJsonFilePath).toString());
    let hadPotentialConflicts = false;
    const map = new Map();
    for (const path of Object.keys((_a = packageLockJson.packages) !== null && _a !== void 0 ? _a : {})) {
        let config = packageLockJson.packages[path];
        const _package = path.match(/.*(@mitech\/[^/@]+)$/);
        if (_package) {
            if (config.link)
                config = packageLockJson.packages[config.resolved];
            if (map.has(_package[1])) {
                for (const old of map.get(_package[1])) {
                    if (old.config.version !== config.version) {
                        hadPotentialConflicts = true;
                        map.set(_package[1], [...map.get(_package[1]), { path: path, config: config }]);
                    }
                }
            }
            else {
                map.set(_package[1], [{ path: path, config: config }]);
            }
        }
    }
    if (hadPotentialConflicts) {
        for (const [key, value] of map.entries()) {
            // NOTE: 1 only value is not a conflict, it's just tracking the initial value
            // for that package
            if (value.length > 1) {
                logger_1.logger.error('Potential conflict: ' + key);
                value.forEach((v) => logger_1.logger.log(` - ${v.path.padEnd(100, '.')} ${v.config.version}`));
            }
        }
        logger_1.logger.log('');
        logger_1.logger.error('Potential conflicts found in package-lock.json. Press Ctrl+C to stop the serve now, otherwise it will continue in 5 seconds....');
        await new Promise(resolve => {
            setTimeout(resolve, 5000);
        });
        logger_1.logger.log('Continuing serve...');
        logger_1.logger.log('');
    }
    else {
        logger_1.logger.success('No potential conflicts found in ' + packageLockJsonFilePath);
    }
}
exports.assertPackageLockPotentialConflicts = assertPackageLockPotentialConflicts;
//# sourceMappingURL=checkPackageLockPotentialConflicts.js.map