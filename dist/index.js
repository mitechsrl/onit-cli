#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_js_1 = require("./types/index.js");
const errorHandler_js_1 = require("./lib/errorHandler.js");
const main_js_1 = require("./bin/main.js");
const fs_1 = require("fs");
function recourseRegisterCommand(parentYargs, commandConfig) {
    const configFilePath = path_1.default.join(__dirname, commandConfig.file);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const command = require(configFilePath).default;
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
        // funzione chiamata sull'esecuzione del comando
        Promise.resolve()
            .then(() => {
            // Non c'è exec specificato
            if (!command.exec)
                throw new index_js_1.StringError('File exec non specificato');
            // command execution callback
            const configFilePath = path_1.default.join(__dirname, commandConfig.file);
            const execFilePath = path_1.default.join(path_1.default.dirname(configFilePath), command.exec + '.js');
            if (!(0, fs_1.existsSync)(execFilePath)) {
                throw new index_js_1.StringError('Questo comando è rotto. Verifica che commandConfig punta a un file di exec valido');
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require(execFilePath).default;
        })
            .then((execFn) => execFn(argv))
            .catch(errorHandler_js_1.errorHandler);
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
// step 1: ottini json dei comandi (precompilato)
new Promise((resolve) => {
    const content = (0, fs_1.readFileSync)(path_1.default.join(__dirname, './commands.json')).toString();
    resolve(JSON.parse(content));
})
    .then((files) => {
    // step 2: monta i comandi
    files.forEach(commandConfig => {
        recourseRegisterCommand(main_js_1.cli, commandConfig);
    });
    // questa roba qui fa partire la cli.
    main_js_1.cli.argv;
})
    .catch(errorHandler_js_1.errorHandler);
//# sourceMappingURL=index.js.map