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

const inquirer = require('inquirer');
const build = require('./_src/build');
const extraStepRunner = require('./_src/lib/extraStepRunner');

module.exports.start = async function (onitBuildFile, version, basepath, params, logger) {
    // check for buildTargets existence
    const buildTargets = onitBuildFile.json.buildTargets || {};
    if (Object.keys(buildTargets).length === 0) {
        logger.error('Nessun build target definito in ' + onitBuildFile.filename);
        return;
    }

    // select build target. If only one buildTarget is available, use that one, show a selection prompt otherwise
    let buildTarget = null;
    if (Object.keys(buildTargets).length === 1) {
        const key = Object.keys(buildTargets)[0];
        buildTarget = buildTargets[key];
        buildTarget.key = key;
    } else {
        const list = [{
            type: 'list',
            name: 'buildTarget',
            message: 'Seleziona un build target',
            choices: Object.keys(buildTargets)
        }];
        const answers = await inquirer.prompt(list);
        buildTarget = buildTargets[answers.buildTarget];
        if (!buildTarget) {
            throw new Error('Errore nella selezione del buildTarget');
        }
        buildTarget.key = answers.buildTarget;
    }
    logger.info('Build target selezionato: ' + buildTarget.key);

    // selector for extra steps (if available)
    let extraSteps = (buildTarget.buildExtraSteps || []);
    if (extraSteps.length > 0) {
        logger.log('Selezione step aggiuntivi post-build:');
        const list = extraSteps.map((step, index) => ({
            type: 'confirm',
            name: 'step_' + index,
            message: 'Eseguire <' + step.name + '>?'
        }));
        const answers = await inquirer.prompt(list);
        extraSteps = extraSteps.filter((step, index) => answers['step_' + index]);
    }

    // effective build
    const { targetDir } = await build.build(logger, buildTarget, onitBuildFile);

    // extra steps management

    const vars = {
        $_PROJECT_DIR: process.cwd(),
        $_BUILD_DIR: targetDir
    };

    if (extraSteps.length > 0) {
        logger.log('');
        logger.log('Avvio esecuzione steps post-build');
        for (const step of extraSteps) await extraStepRunner(logger, step, vars);
    }
};
