/**
 * Load the mitown file config.
 *
 * NOTE: this is valid in dev env only
 */

const fs = require('fs');
const path = require('path');


/**
 * 
 * @param {*} fileType 
 * @param {*} srcPath 
 * @param {*} silent
 */
module.exports.load = (fileType, srcPath = process.cwd()) => {
    let fileNameWithoutExt = null;
    if (fileType === 'run'){
        fileNameWithoutExt = 'onitrun.config'
    }else if (fileType === 'build'){
        fileNameWithoutExt = 'onitbuild.config'
    }else{
        throw new Error("unknown fileType "+fileType);
    }

    let error = null;
    let json = null;
    let filename = null;
    let jsfile = path.join(srcPath, fileNameWithoutExt+'.js');
    let jsonfile = path.join(srcPath, fileNameWithoutExt+'.json');

    if (fs.existsSync(jsfile)){
        json = require(jsfile);
        filename = jsfile;
    }else if(fs.existsSync(jsonfile)){
        try{
            json = JSON.parse(fs.readFileSync(jsonfile).toString());
            filename = jsonfile
        }catch(e){
            error = e;
        }
    }else{
        error = new Error("File "+fileNameWithoutExt+".[js,json] Non trovato.");
        error.notFound = true;
    }


    if (error) return Promise.reject(error)

    return Promise.resolve({
        json: json,
        filename: filename
    })
}
