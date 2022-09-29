const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

function _fixPackageJson (filename, answers) {
    const content = JSON.parse(readFileSync(filename).toString());
    content.name = answers.appName;
    content.description = answers.appDescription;
    content.version = '0.0.1';
    writeFileSync(filename, JSON.stringify(content, null, 4));
}

module.exports.fixPackageJson = async function (cwd, answers) {
    await _fixPackageJson(join(cwd, 'package.json'), answers);
    await _fixPackageJson(join(cwd, 'package-lock.json'), answers);
};
