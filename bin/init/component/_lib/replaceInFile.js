const { readFileSync, writeFileSync } = require('fs');

module.exports.relpaceInFile = async function (filename, match, replace) {
    let content = readFileSync(filename, '').toString();
    content = content.replace(match, replace);
    writeFileSync(filename, content);
};
