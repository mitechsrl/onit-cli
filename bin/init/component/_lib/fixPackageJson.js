const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

module.exports.fixPackageJson = async function (cwd, answers) {
    const filename = join(cwd, 'package.json');
    const content = JSON.parse(readFileSync(filename).toString());
    content.name = answers.appName;
    content.description = answers.appDescription;
    content.version = '0.0.1';
    writeFileSync(filename, JSON.stringify(content, null, 4));
};
