/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */

const onitFileLoader = require('../../lib/onitFileLoader');
const inquirer = require('inquirer');
const build = require('./_src/build');
const extraStepRunner = require('./_src/lib/extraStepRunner');
const os = require('os');


module.exports.info = 'Onit build utility';
module.exports.help = [];

module.exports.cmd = async function (basepath, params, logger) {
    
    const onitBuildFile = await onitFileLoader.load('build');

    const buildTargets = onitBuildFile.json.buildTargets || {};
    if (Object.keys(buildTargets).length == 0){
        logger.error("Nessun build target definito in "+onitBuildFile.filename);
        return;
    }


    // select build target
    let list = [{
        type:'list',
        name:'buildTarget',
        message: 'Seleziona un build target',
        choices: Object.keys(buildTargets)
    }];
    let answers = await inquirer.prompt(list);
    const buildTarget = buildTargets[answers.buildTarget];
    if (!buildTarget){
        throw new Error("Errore nella selezione del buildTarget");
    }

    // selector for extra steps
    let extraSteps = (buildTarget.buildExtraSteps || []);
    if (extraSteps.length === 0) return [];
    logger.log("Selezione step aggiuntivi post-build:")
    list = extraSteps.map((step,index) => ({
            type:'confirm',
            name: 'step_'+index,
            message: "Eseguire <"+step.name+">?"
    }));
    answers = await  inquirer.prompt(list);
    extraSteps = extraSteps.filter((step, index) => answers['step_'+index]);

    // we have all the needed data.
    // launch the build process
    try{
        let { targetDir } = await build.build(logger, buildTarget, onitBuildFile);
        
        const vars = {
            $_PROJECT_DIR: process.cwd(),
            $_BUILD_DIR: targetDir
        }

        if (extraSteps.length>0){
            logger.log("");
            logger.log("Avvio esecuzione steps post-build")
            for(step of extraSteps) await extraStepRunner(logger, step, vars);
        }

    } catch (e) {
        logger.error(e.message);
        logger.error("Build interrotto");
        process.exit(-1);
    }
};
