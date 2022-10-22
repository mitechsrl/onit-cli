#!/usr/bin/env node

import { ScanCommandResult } from './lib/scanCommands.js';
import path from 'path';
import { Command, StringError } from './types/index.js';
import { errorHandler } from './lib/errorHandler.js';
import { cli } from './bin/main.js';
import yargs from 'yargs';
import fs from 'fs';
import { closeOutputRedirction, setupOutputRedirecion } from './lib/outputRedirection.js';


// generic check for log to file.
const redirectOutput = process.argv.find(p => p === '--log-to-file');

function recourseRegisterCommand(parentYargs: yargs.Argv, commandConfig: ScanCommandResult) {
    const configFilePath = path.join(__dirname,commandConfig.file);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const command: Command = require(configFilePath).default;
    parentYargs.command(commandConfig.cmd, command.description, (_yargs) => {

        // setta il testo dell'usage (mostrato come testo aggiuntivo sull'help)
        if (command.longHelp) {
            _yargs.usage(command.longHelp);
        }
        // dichiara i parametri.
        // vedi https://yargs.js.org/docs/#api-reference-optionkey-opt
        command.params.forEach(p => {
            _yargs.option(p.name, p.config);
        });

        // Reitera sui child e agganciali come sottocomendi di questo comando (_yargs)
        commandConfig.children.forEach(child => {
            recourseRegisterCommand(_yargs, child);
        });

        // se strict, lancia errore per sottocomandi non conosciuti
        // Se non strict, chiama l'ultimo padre riconosciuto e passagli i restanti parametri
        // https://yargs.js.org/docs/#api-reference-strictcommandsenabledtrue
        _yargs.strictCommands(command.strictCommands !== false);

    }, (argv) => {
        // Command method runner        
        let promise = Promise.resolve();
        if (redirectOutput){
            promise = setupOutputRedirecion();
        }

        promise.then(() => {
            // Non c'è exec specificato
            if (!command.exec) throw new StringError('File exec non specificato');

            // command execution callback
            const configFilePath = path.join(__dirname,commandConfig.file);
            const execFilePath = path.join(path.dirname(configFilePath), command.exec+'.js');

            if (!fs.existsSync(execFilePath)) {
                throw new StringError('Questo comando è rotto. Verifica che commandConfig punta a un file di exec valido');
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require(execFilePath).default;
        })
        .then((execFn) => execFn(argv))
        .catch(errorHandler)
        .then(() => {
            if (redirectOutput) return closeOutputRedirction();
        })
    });
}

// NOTA: lo scan dei comandi è stato demandato a compile time.
// Al posto della promise che legge il json, c'era 
// scanCommands(path.join(__dirname, './bin'), '');
//
// Lo script ./dist/lib/generateScanResultFile.js genera un json chiamando la funzione di scan 
// e salva il tutto su file. A runtime, non viene eseguita la scansione ma viene letto il file
// Questo rende l'avvio piu leggero e piu veloce.
// Se vuoi ripristinare lo scan ad ogni boot, sostituisci la promise con la riga
// scanCommands(path.join(__dirname, './bin'), '');



fs.promises.readFile(path.join(__dirname,'./commands.json'))
    .then((content: Buffer) => {
        const commands = JSON.parse(content.toString()) as ScanCommandResult[]

        // step 2: monta i comandi
        commands.forEach(commandConfig => {
            recourseRegisterCommand(cli, commandConfig);
        });

        return cli.parse();
    })
    .catch(errorHandler)

