const path = require('path');
const loadIgnore = require('./lib/loadIgnore');
const copy = require('./lib/copy');
const webpack = require('./lib/webpack');
const clean = require('./lib/clean');

module.exports.build = async function (logger, buildTarget, onitBuildFile) {

    const buildMode = buildTarget.mode || 'production';
    const baseName = path.basename(process.cwd());
    const targetDir = path.resolve(process.cwd(),'../.build-'+buildMode+'-'+baseName);
    
    const ig = loadIgnore();

    
    await copy(logger, targetDir, ig);
    await webpack(logger, targetDir, onitBuildFile, buildMode);
    await clean(logger, targetDir, buildMode);
    
    logger.info("Build completato!")
    
    return {
        targetDir: targetDir
    }
    
}