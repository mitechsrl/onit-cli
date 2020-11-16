const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const find = require('find');
const onitFileLoader = require('../../../../lib/onitFileLoader');

const searchEntryPoints = (onitRunFile) => {
    // search for webpack entry points: files from process.cwd()/config.path/.../react/webpack.json
    const entryPoints = {};
    const regex = /react[\\/]webpack\.json$/;

    var searchPath = path.resolve(process.cwd(), 'client');
    var files = find.fileSync(regex, searchPath);
    files.forEach(f => {
        const file = require(f);
        Object.keys(file.entry || {}).forEach(epKey => {
            const id = './'+path.relative(process.cwd(), path.resolve(path.dirname(f), epKey));
            const name = './'+path.relative(process.cwd(), path.resolve(path.dirname(f), file.entry[epKey]));
            entryPoints[id] = name;
        });
    });


    // on dev mode, add entry points from enabled components (if any) so we can launch a single webpack in dev mode
    onitRunFile.json.loadComponents.filter(c => c.enabled).forEach(c => {
        const componentPath = path.resolve(process.cwd(), c.path, 'client');
        if (fs.existsSync(componentPath)) {
            // search for webpack.json files on subcomponents
            const files = find.fileSync(regex, componentPath);
            files.forEach(f => {
                const file = require(f);
                Object.keys(file.entry || {}).forEach(epKey => {
                    const id = path.relative(process.cwd(), path.join(path.dirname(f), epKey));
                    const name = path.join(path.dirname(f), file.entry[epKey]);
                    entryPoints[id] = name;
                });
            });
        }
    });


    return entryPoints;
}

/**
 * 
 * @param {*} dst 
 * @param {*} src 
 */
const webpackMergeFn = (dst, src)=>{
    if (Array.isArray(dst)) return dst.concat(src);
    return undefined;
}

/**
 * 
 * @param {*} onitRunFile 
 * @param {*} onitBuildFileFile 
 */
const getOnitBuildFilesData = async (onitRunFile, onitBuildFileFile) => {
   
    let config = _.get(onitBuildFileFile, 'json.export.webpack', {})

    // on dev mode, add entry points from enabled components (if any) so we can launch a single webpack in dev mode
    const enabledModues = onitRunFile.json.loadComponents.filter(c => c.enabled);

    for(c of enabledModues){
        const componentPath = path.resolve(process.cwd(), c.path);
        
        if (fs.existsSync(componentPath)) {
            let buildData = null;
            try{
                buildData = await onitFileLoader.load('build', componentPath);
            }catch(error){
                // files not found errors don't throw here.
                if (!error.notFound) throw(e);
            }
            
            const thisModuleConfig = _.get(buildData, 'json.export.webpack', {});
            config = _.mergeWith(config, thisModuleConfig, webpackMergeFn)
        }
    }

    return config;
}

module.exports.stop = function() {
   
}

module.exports.start = async (logger, onitRunFile, mainOnitBuildFile, events) => {

    // load the default config
    let  webpackConfig = require('../configFiles/webpack.config');

    // add dynamic entry points to the webpack config
    webpackConfig.entry = searchEntryPoints(onitRunFile);

    const onitBuildWebpackData = await getOnitBuildFilesData(onitRunFile, mainOnitBuildFile);

    webpackConfig = _.mergeWith(webpackConfig, onitBuildWebpackData, webpackMergeFn);

    // watcher callback
    const watcherCallback = (err, stats) => {
        // do we had internal errors?
        if (err) {
            logger.error('[WEBPACK] compile error');
            logger.error(err.stack || err);
            if (err.details) logger.error(err.details);
            return;
        }

        // do we had compile errors?
        const info = stats.toJson();
        if (stats.hasErrors()) {
            logger.error('[WEBPACK] compile error');
            info.errors.forEach(e => logger.error(e));
            return;
        }

        console.info('[WEBPACK] Compile finished');
    }


    return new Promise(resolve =>{

        // create a compiler based on the config
        const compiler = webpack(webpackConfig);

        // start the watcher!
        const watcher = compiler.watch({
            aggregateTimeout: 500,
            ignored: ['files/**/*.js', 'node_modules/**']
        }, watcherCallback);


        events.on('SIGINT',() =>{
            logger.warn("Stop webpack watcher...");
            watcher.close(() => {
                logger.warn("Webpack watch stopped");
                resolve(0);
            });
        })
    })
}