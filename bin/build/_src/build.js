const path = require('path');
const loadIgnore = require('./lib/loadIgnore');
const copy = require('./lib/copy');
const webpack = require('./lib/webpack');
const clean = require('./lib/clean');

module.exports.build = async function (logger, buildTarget, onitBuildFile) {

    const buildMode = buildTarget.mode || 'production';
    const baseName = path.basename(process.cwd());
    const targetDir = path.resolve(process.cwd(),'./build/'+(buildTarget.key || buildMode));
    

    const ignoreFiles = [
        path.join(process.cwd(), './.onitbuildignore'),
        path.join(__dirname, '../../../configFiles/build/.defaultignore')
    ]

    const ig = loadIgnore(ignoreFiles);
    
    await copy(logger, targetDir, ig);
    await webpack(logger, targetDir, onitBuildFile, buildMode);

    const nonMinBuildExtraConfig = {
        optimization: { minimize: false},
        output: {filename: '[name].js'},
    }
    await webpack(logger, targetDir, onitBuildFile, buildMode, nonMinBuildExtraConfig);

    await clean(logger, targetDir, buildMode);
    
    logger.info("Build completato.")
    logger.info("Directory di build: "+targetDir)
    
    
    return {
        targetDir: targetDir
    }
    
}