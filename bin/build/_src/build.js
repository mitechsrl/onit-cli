const path = require('path');
const loadIgnore = require('./lib/loadIgnore');
const copy = require('./lib/copy');
const webpack = require('./lib/webpack');

module.exports.build = async function (logger, buildTarget, onitBuildFile) {

    const buildMode = buildTarget.mode || 'production';
    const baseName = path.basename(process.cwd());
    const targetDir = path.resolve(process.cwd(),'../.build-'+buildMode+'-'+baseName);
    
    const ig = loadIgnore();

    
    await copy(logger, ig, targetDir);
    await webpack(logger, targetDir, onitBuildFile)

}