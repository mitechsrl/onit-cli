
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
            const cmd = Array.isArray(step.cmd) ? step.cmd[0] : step.cmd;
            const params = (Array.isArray(step.cmd) && (step.cmd.length>1)) ? [step.cmd[1]] : [];
            
            await spawn(cmd, params, true, {
                // This allows to run command on windows without adding '.cmd' or '.bat'. See 
                // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
                shell: true,

                // NOTE: this is inherithed from the current process(which already did the cwd!)
                cwd: process.cwd() 
            });
        }
        
        if (originalCwd){
            process.chdir(originalCwd);
        }

        logger.log("Step <"+step.name+"> completo!");
        resolve(0);
    })
}