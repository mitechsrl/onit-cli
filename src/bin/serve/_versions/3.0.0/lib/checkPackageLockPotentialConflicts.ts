import { OnitConfigFile } from '../../../../../types';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../../../lib/logger';

/**
 * Prints potential conflicts by checking if "@mitech/..."" packages are installed in different versions
 * in the package-lock.json
 * 
 * @param onitConfigFile 
 */
export async function assertPackageLockPotentialConflicts(onitConfigFile: OnitConfigFile){

    // Where to search for the package-lock.json
    const searchPaths = [
        process.cwd(), // Current dir, for standalone projects
        path.join(process.cwd(), '../'), // parent dir, for workspace projects
        ...onitConfigFile.sources.map(s => path.dirname(s)), // same dir as the onit config file
        ...onitConfigFile.sources.map(s => path.join(path.dirname(s), '../')) // parent dir of the onit config file, probably for workspaces
    ];

    const file = searchPaths.find(p => fs.existsSync(path.join(p, 'package-lock.json')));

    // Should not happen, but in case no check is applied
    if (!file) return;

    const packageLockJsonFilePath = path.join(file, 'package-lock.json');
    const packageLockJson = JSON.parse(fs.readFileSync(packageLockJsonFilePath).toString());

    let hadPotentialConflicts = false;

    const map = new Map();
    for (const path of Object.keys(packageLockJson.packages ?? {})) {
        let config = packageLockJson.packages[path];
        const _package = path.match(/.*(@mitech\/[^/@]+)$/);
        if (_package){
            if (config.link) config = packageLockJson.packages[config.resolved];
            if (map.has(_package[1])) {
                for (const old of map.get(_package[1])) {
                    if (old.config.version !== config.version) {
                        hadPotentialConflicts = true;
                        map.set(_package[1], [...map.get(_package[1]), { path: path, config:config }]);
                    }
                }                
            }else{
                map.set(_package[1], [{ path: path, config:config }]);
            }
        }
    }

    if (hadPotentialConflicts) {

        for (const [key, value] of map.entries()) {
                        
            // NOTE: 1 only value is not a conflict, it's just tracking the initial value
            // for that package
            if (value.length > 1){
                logger.error('Potential conflict: '+ key);
                value.forEach((v: any) => logger.log(` - ${v.path.padEnd(100, '.')} ${v.config.version}`));
            }
        }
        logger.log('');
        const _p = path.relative(process.cwd(), packageLockJsonFilePath);
        logger.warn(`Potential conflicts found in '${_p}'. Press Ctrl+C to stop the serve now, otherwise it will continue in 5 seconds....`);
        logger.log('');
        logger.warn(`You can try to fix this with 'npm install --prefer-dedupe' in path '${path.dirname(_p)}'`);
        logger.log('');
        await new Promise(resolve => {
            setTimeout(resolve, 5000);
        });
        logger.log('Continuing serve...');
        logger.log('');
    }else{
        logger.success('No potential conflicts found in '+packageLockJsonFilePath);
    }
}