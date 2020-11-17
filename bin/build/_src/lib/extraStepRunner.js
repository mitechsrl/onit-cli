
const spawn = require('../../../../lib/spawn');


const replace = function(obj, vars){

    const stringReplace = function(v){

        while(true){
            let found = false;
            Object.keys(vars).forEach(variable => {
                const _v = v.replace(variable, vars[variable]);
                found = found || _v !== v;
                v = _v;
            });
            if (!found) break;
        }
        return v;
        
    }

    const _replace = function (obj){
        
        if (Array.isArray(obj)) obj.forEach(o => _replace(o));

        if (obj && typeof obj === "object"){
            Object.keys(obj).forEach(k => {
                if (typeof obj[k] === "string"){
                    obj[k] = stringReplace(obj[k]);
                    return;
                }

                _replace(obj[k])
            })
        }
    }

    _replace(obj);
    return obj;
}
module.exports = (logger, step, vars) => {
    return new Promise(async (resolve,reject)=> {

        logger.log("Eseguo step <"+step.name+">...")
        step = replace(step, vars);
        let originalCwd = null;
        if (step.cwd){
            originalCwd = process.cwd();
            process.chdir(step.cwd);
        }

        // handler for cmd-type step
        if (step.cmd){
            await spawn(step.cmd[0] || step.cmd, step.cmd[1] || [], true, {
                cwd: process.cwd() // NOTE: this is inherithed from the current process(which already did the cwd!)
            });
        }
        
        if (originalCwd){
            process.chdir(originalCwd);
        }

        logger.log("Step <"+step.name+"> completo!");
        resolve(0);
    })
}