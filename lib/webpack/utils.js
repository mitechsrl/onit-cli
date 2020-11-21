const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const onitFileLoader = require('../onitFileLoader');
const find = require('find');


/**
* 
* @param {*} onitRunFile 
* @param {*} onitBuildFileFile 
*/
const getOnitBuildFilesData = async (onitRunFile, onitBuildFileFile) => {
  
    let config = _.get(onitBuildFileFile, 'json.export.webpack', {})

    

    
    if (onitRunFile){
        // on dev mode, we need to add entry points from enabled components (if any) so we can launch a single webpack in dev mode
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

    }else{

        // build mode. Check for dependencies and load their exports.
        // Dependencies are searched on this folder or ancestors
        let dependencies =  _.get(onitBuildFileFile, 'json.dependencies', []);

        for (dependency of dependencies){

            let dependencyModulePath = path.resolve(process.cwd(), dependency);
            let found = false;
            while(true){
                if (fs.existsSync(dependencyModulePath)){
                    console.log("[WEBPACK] trovata dipendenza "+dependency+" in "+dependencyModulePath);
                    found = true;
                    break;
                }
                const _p = path.resolve(dependencyModulePath, '../../'+ dependency);
                // no more top dirs available
                if (_p === dependencyModulePath) break;
                dependencyModulePath = _p;
            }
            
            // dependency module found. get his exports
            if (found){
                let buildData = null;
                try{
                    buildData = await onitFileLoader.load('build', dependencyModulePath);
                }catch(error){
                    // if the module don't have a onitBuild file, just skip
                    if (!error.notFound) throw(error);
                }
                const thisModuleConfig = _.get(buildData, 'json.export.webpack', {});
                config = _.mergeWith(config, thisModuleConfig, webpackMergeFn)

            }else{
                throw new Error("Dipendenza "+dependency+" non trovata")
            }
        };
    }

    return config;
}

/**
 * Scan the dev environment to find for webpack.json files.
 * These ones in our env keep data of entry points.
 * These data is then merged into one single bigger webpack config json 
 * 
 * @param {*} onitRunFile config json from onitrun.config.json at the current dir
 */
const searchEntryPoints = (onitRunFile) => {

    // search in these subdirs of the provided one.
    const searchSubDirs = ['client','static'];

    // search for webpack entry points: files from process.cwd()/config.path/.../react/webpack.json
    const entryPoints = {};
    const regex = /[\\/]webpack\.json$/;

    const files = searchSubDirs.reduce((files, subdir)=>{
        subdir = path.resolve(process.cwd(), subdir);
        if (fs.existsSync(subdir)){
            files.push(...find.fileSync(regex, subdir));
        }
        return files
    },[]);

    files.forEach(f => {
        const file = require(f);
        Object.keys(file.entry || {}).forEach(epKey => {
            const id = path.relative(process.cwd(), path.resolve(path.dirname(f), epKey));
            const name = path.resolve(path.dirname(f), file.entry[epKey]);
            entryPoints[id] = name;
        });
    });


    // on dev mode we also have a run file with extra entry points from enabled components (if any) so we can launch a single webpack in dev mode
    if (onitRunFile){
        (onitRunFile.json.loadComponents || [])
        .filter(c => c.enabled) // skip disabled ones
        .filter(c => c.path.indexOf('node_modules')<0) // still never search stuff in ode_modules
        .forEach(c => {

            const files = searchSubDirs.reduce((files, subdir)=>{
                subdir = path.resolve(process.cwd(), c.path, subdir);
                if (fs.existsSync(subdir)){
                    files.push(...find.fileSync(regex, subdir));
                }
                return files
            },[]);

            files.forEach(f => {
                const file = require(f);
                Object.keys(file.entry || {}).forEach(epKey => {
                    const id = path.relative(process.cwd(), path.resolve(path.dirname(f), epKey));
                    const name = path.resolve(path.dirname(f), file.entry[epKey]);
                    entryPoints[id] = name;
                });
            });
        });
    }

    return entryPoints;
}

/**
 * Merge function for webpack config. NOTE: this function will be called by lodash mergeWith.
 * The only extra stuff this fn does is to concat arrays, other stuff is managed automatically by _.merge.
 * @param {*} dst 
 * @param {*} src 
 */
const webpackMergeFn = (dst, src)=>{
    if (Array.isArray(dst)) return dst.concat(src);
    return undefined;
}



module.exports.searchEntryPoints = searchEntryPoints;
module.exports.webpackMergeFn = webpackMergeFn
module.exports.getOnitBuildFilesData = getOnitBuildFilesData