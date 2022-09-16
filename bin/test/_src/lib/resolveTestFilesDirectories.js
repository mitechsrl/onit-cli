const path = require('path');
const glob = require('glob-all');

/**
 * Scan directories for test cases files. Directory match can be inglob syntax
 *
 * @param {*} testTarget
 * @return A promise which resolves with the files list
 */
function resolveTestFilesDirectories (testTarget) {
    return new Promise((resolve, reject) => {
        glob(testTarget.testFilesDirectories, {}, function (error, files) {
            if (error) { return reject(error); }
            files = files
                .filter(f => f.endsWith('.js'))
                .map(f => path.resolve(process.cwd(), f));

            resolve(files);
        });
    });
}
module.exports.resolveTestFilesDirectories = resolveTestFilesDirectories;
