const path = require('path');

/**
 * Search and require an instance of mocha in the target workspace
 * @returns;
 */
function requireMochaFromProcessCwd () {
    const base = process.cwd();
    let mocha = null;
    [
        './node_modules/mocha',
        '../node_modules/mocha'
    ].find(p => {
        try {
            console.log(path.join(base, p));
            mocha = require(path.join(base, p));
            return true;
        } catch (e) {
            return false;
        }
    });
    return mocha;
}
module.exports.requireMochaFromProcessCwd = requireMochaFromProcessCwd;
