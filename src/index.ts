#!/usr/bin/env node

import { logger } from './lib/logger';

// Hack for retrocompatibility: for versions <3.0.0, i was parsing the parameters manually by reading directly 
// process.argv. I wasn't aware that by standard, long alias were supposed to have double dashes (like --exit)
// instead of one (like -exit) so a lot of tools are calling onit-cli using single dashes.
// Now the parameters are parsed with yargs and it force to have two dashes. This small script translate some 
// of them to two dashes.
// Doing it before anything else to be available globally. 
['-exit','-watch','-debug'].forEach(c => {
    process.argv.forEach((p,index)=> {
        if (p === c ){
            logger.warn(':warning:  Deprecated param '+p+'. Use double dashed -'+p);
            process.argv[index] = '-'+process.argv[index];
        }
    });
});

import { ScanCommandResult } from './lib/scanCommands';
import path from 'path';
import { Command, StringError } from './types/index';
import { errorHandler } from './lib/errorHandler';
import { cli } from './bin/main';
import yargs from 'yargs';
import fs from 'fs';
import { closeOutputRedirection, setupOutputRedirection } from './lib/outputRedirection';
import { npmVersionCheck } from './lib/npm';

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

        // Error on unrecognized subcommands
        // Se non strict, chiama l'ultimo padre riconosciuto e passagli i restanti parametri
        // https://yargs.js.org/docs/#api-reference-strictcommandsenabledtrue
        _yargs.strictCommands(command.strictCommands !== false);

        // error on unrecognized options
        // https://yargs.js.org/docs/#api-reference-strictoptionsenabledtrue
        _yargs.strictOptions(command.strictOptions !== false);

    }, (argv) => {
        // Command method runner        
        let promise = Promise.resolve();
        if (redirectOutput){
            promise = setupOutputRedirection();
        }
        let hadError = false;
        promise.then(() => {
            // Non c'è exec specificato
            if (!command.exec) throw new StringError('No exec file defined. This is a onit-cli error, please report it.');

            // command execution callback
            const configFilePath = path.join(__dirname,commandConfig.file);
            const execFilePath = path.join(path.dirname(configFilePath), command.exec+'.js');

            if (!fs.existsSync(execFilePath)) {
                throw new StringError('This command appear to be broken. No exec file found. This is a onit-cli error, please report it.');
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require(execFilePath).default;
        })
            .then((execFn) => execFn(argv))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((e:any) => {
                hadError = true;
                errorHandler(e, argv);
                
            })
            .then(() => {
                if (redirectOutput) return closeOutputRedirection();
            })
            .then(() => {
                process.exit(hadError ? -1: 0);
            });
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
        const commands = JSON.parse(content.toString()) as ScanCommandResult[];

        // step 2: monta i comandi
        commands.forEach(commandConfig => {
            recourseRegisterCommand(cli, commandConfig);
        });

        // launch async check for new version
        npmVersionCheck();
        
        return cli.parse();
    })
    .catch(errorHandler);

