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

import inquirer from 'inquirer';
import path from 'path';
import { directoryConfigsScanner } from './directoryConfigsScanner';
import { logger } from './logger';
import { SshSession } from './ssh';
 
/**
  * funzione helper per eseguire configurazioni linux
  * Questa funzione si aspetta esista una directory configDirectory, che contenga la seguente struttura:
  *
  * configDir1
  *   - commands.js -> file che esporta una funzione da eseguire alla scelta di qeusta config
  *   - config.js -> esporta oggetto
  *     {
  *        name:string, // nome della modalità
  *        value: {
  *            questions:[array di questions inquirer], // array di voci inquirer da mostrare
  *            validateAnswers: (answers) => boolean // funzone validazione risposte. Throw in caso di errore
  *        }
  *     }
  * configDir[2,3,...N]
  *    - commands.js
  *    - config.js
  * 
  * @param {*} session sessione ssh remota
  * @param {*} configDirectory config directory da scannerizzare alla ricerca di configurazioni
  * @returns
  */
export async function runLinuxConfiguration(session:SshSession, configDirectory:string){
    // get the list of available configurations
    const configs = await directoryConfigsScanner(configDirectory);
 
    const questions = [
        {
            type: 'list',
            name: 'mode',
            message: 'Modalità di setup',
            choices: configs
        }
    ];
 
    // ask the user for the configuration to be used, the run it
    const _mode = await inquirer.prompt(questions);
    const mode = _mode.mode;
 
    let answers = {};
    if (mode.questions) {
        answers = await inquirer.prompt(mode.questions);
        if (mode.validateAnswers) {
            mode.validateAnswers(answers);
        }
    }
 
    // update e upgrade preventivo del sistema
    logger.log('Eseguo <sudo apt update>');
    await session.command('sudo apt update');
 
    // install dos2unix per evitare problemi di \r\n su server quando si caricano i files creati da windows
    logger.log('Eseguo <sudo apt install dos2unix>');
    await session.command('sudo apt install dos2unix');
 
    // lancio comandi configurazione
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const linuxCmds = require(path.join(mode.dir + '/commands.js')).default;
    return linuxCmds(session, answers);
}