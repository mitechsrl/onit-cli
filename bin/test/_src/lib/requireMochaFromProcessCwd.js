const path = require('path');
const logger = require('../../../../lib/logger');

/**
 * Search and require an instance of mocha in the target workspace
 * @returns;
 */
function requireMochaFromProcessCwd () {
    const base = process.cwd();
    let importPath = null;
    let mocha = null;
    [
        './node_modules/mocha',
        '../node_modules/mocha'
    ].find(p => {
        try {
            // console.log(path.join(base, p));
            importPath = path.join(base, p);
            mocha = require(importPath);
            return true;
        } catch (e) {
            importPath = null;
            return false;
        }
    });
    if (importPath) {
        logger.log('Found a mocha instance in ' + importPath);
    }
    return mocha;
}
module.exports.requireMochaFromProcessCwd = requireMochaFromProcessCwd;
