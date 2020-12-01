/**
 * helper functions for grabbing parameters from command line
 */

'use strict';

const argvParamValue = function (flag) {
    const index = process.argv.findIndex(arg => arg === flag);
    if (index >= 0) { return process.argv[index + 1]; }
    return null;
};

const haveArgvParam = function (flag) {
    const index = process.argv.findIndex(arg => arg === flag);
    return index >= 0;
};

module.exports.value = argvParamValue;
module.exports.has = haveArgvParam;
