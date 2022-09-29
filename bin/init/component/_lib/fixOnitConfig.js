const path = require('path');
const { relpaceInFile } = require('./replaceInFile');

module.exports.fixOnitConfig = async function (cwd, answers) {
    // replace database name in onit.config.js
    await relpaceInFile(
        path.join(cwd, './onit.config.js'),
        /^(.*database: +['"]{1,1})[a-zA-Z0-9-_]+(['"]{1,1}.*)/mg,
        `$1${answers.databaseName}$2`);
};
