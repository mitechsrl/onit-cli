var nodemon = require('nodemon');
const fs = require('fs');
const path = require('path');


module.exports.start = async (logger, onitRunFile) => {

    return new Promise((resolve,reject)=> {
        
        // add this to a delay so we give some time to other process to start without being too much cpu-heavy
        let delay = setTimeout(()=>{
            delay = null;

            // serve: devo calcolare la config di nodemon prima di lanciarlo a partire dal file di config onitrun.config.[js,json]
            const nodemonConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../configFiles/serve/nodemon.json')).toString());
            // 1) aggiungo watch su moduli caricati così cambiamenti in quelle cartelle rilanciano nodemon!
            const enabledModulesPaths = (onitRunFile.json.loadComponents || []).filter(c => c.enabled).map(c => c.path);
            nodemonConfig.watch = [process.cwd(), ...(nodemonConfig.watch || []), ...enabledModulesPaths];
            // 2) aggiungo environment
            const env = (onitRunFile.json.environment || {});
            Object.keys(env).forEach(key => {
                if ("object" === typeof env[key]){ env[key] = JSON.stringify(env[key]); }
            })
            const _env = Object.assign({ONIT_RUN_FILE: onitRunFile.filename}, nodemonConfig.env || {}, env);
            if (Object.keys(_env).length>0) nodemonConfig.env = _env;


            nodemon(nodemonConfig);
          
            nodemon.on('quit', function () {
                logger.warn('App terminata');
                resolve(0)
            });
            nodemon.on('log', function (log) {
                console.log(log.colour);
            });

            //nodemon.on('stdout', v => console.log(v));
            //nodemon.on('stderr', v => console.log(v));
        }, 5000);
        
        
        process.on('SIGINT',() =>{
            logger.warn("Stop/reset nodemon...");
            if (delay){
                clearTimeout(delay);
            }else{
                nodemon.reset();
            }
            resolve(0);
        })
    });
}