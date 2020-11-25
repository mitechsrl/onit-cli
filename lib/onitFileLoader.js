/**
 * Load the mitown file config.
 *
 * NOTE: this is valid in dev env only
 */

const fs = require('fs');
const path = require('path');

/**
 *
 * @param {*} fileType
 * @param {*} context
 * @param {*} silent
 */
module.exports.load = (fileType, context = process.cwd()) => {
    let fileNameWithoutExt = null;
    if (fileType === 'run') {
        fileNameWithoutExt = 'onitrun.config';
    } else if (fileType === 'build') {
        fileNameWithoutExt = 'onitbuild.config';
    } else {
        throw new Error('unknown fileType ' + fileType);
    }

    let error = null;
    let json = null;
    let filename = null;
    const jsfile = path.join(context, fileNameWithoutExt + '.js');
    const jsonfile = path.join(context, fileNameWithoutExt + '.json');

    if (fs.existsSync(jsfile)) {
        json = require(jsfile);
        filename = jsfile;
    } else if (fs.existsSync(jsonfile)) {
        try {
            json = JSON.parse(fs.readFileSync(jsonfile).toString());
            filename = jsonfile;
        } catch (e) {
            error = e;
        }
    } else {
        error = new Error('File ' + fileNameWithoutExt + '.[js,json] Non trovato in ' + context);
        error.notFound = true;
    }

    if (error) return Promise.reject(error);

    return Promise.resolve({
        json: json,
        filename: filename
    });
};
