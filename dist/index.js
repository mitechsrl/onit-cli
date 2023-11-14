#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./lib/logger");
// Hack for retrocompatibility: for versions <3.0.0, i was parsing the parameters manually by reading directly 
// process.argv. I wasn't aware that by standard, long alias were supposed to have double dashes (like --exit)
// instead of one (like -exit) so a lot of tools are calling onit-cli using single dashes.
// Now the parameters are parsed with yargs and it force to have two dashes. This small script translate some 
// of them to two dashes.
// Doing it before anything else to be available globally. 
['-exit', '-watch', '-debug'].forEach(c => {
    process.argv.forEach((p, index) => {
        if (p === c) {
            logger_1.logger.warn(':warning:  Deprecated param ' + p + '. Use double dashed -' + p);
            process.argv[index] = '-' + process.argv[index];
        }
    });
});
const path_1 = __importDefault(require("path"));
const index_1 = require("./types/index");
const errorHandler_1 = require("./lib/errorHandler");
const main_1 = require("./bin/main");
const fs_1 = __importDefault(require("fs"));
const outputRedirection_1 = require("./lib/outputRedirection");
const npm_1 = require("./lib/npm");
const nerd_1 = require("./lib/nerd");
// generic check for log to file.
const redirectOutput = process.argv.find(p => p === '--log-to-file');
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
        if (redirectOutput) {
            promise = (0, outputRedirection_1.setupOutputRedirection)();
        }
        let hadError = false;
        promise.then(() => {
            // Non c'è exec specificato
            if (!command.exec)
                throw new index_1.StringError('No exec file defined. This is a onit-cli error, please report it.');
            // command execution callback
            const configFilePath = path_1.default.join(__dirname, commandConfig.file);
            const execFilePath = path_1.default.join(path_1.default.dirname(configFilePath), command.exec + '.js');
            if (!fs_1.default.existsSync(execFilePath)) {
                throw new index_1.StringError('This command appear to be broken. No exec file found. This is a onit-cli error, please report it.');
            }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require(execFilePath).default;
        })
            .then((execFn) => execFn(argv))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((e) => {
            hadError = true;
            (0, errorHandler_1.errorHandler)(e, argv);
        })
            .then(() => {
            if (redirectOutput)
                return (0, outputRedirection_1.closeOutputRedirection)();
        })
            .then(() => {
            if (nerd_1.isNerd) {
                (0, nerd_1.yourScriptHasBeenTerminated)();
            }
            process.exit(hadError ? -1 : 0);
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
(0, npm_1.npmVersionCheck)()
    .then(() => fs_1.default.promises.readFile(path_1.default.join(__dirname, './commands.json')))
    .then((content) => {
    const commands = JSON.parse(content.toString());
    // step 2: monta i comandi
    commands.forEach(commandConfig => {
        recourseRegisterCommand(main_1.cli, commandConfig);
    });
    // launch async check for new version
    return main_1.cli.parse();
})
    .catch(errorHandler_1.errorHandler);
//# sourceMappingURL=index.js.map