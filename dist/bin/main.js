"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const yargs_1 = __importDefault(require("yargs"));
const header_1 = require("../lib/header");
const logger_1 = require("../lib/logger");
const packageJson_1 = require("../lib/packageJson");
exports.cli = yargs_1.default.scriptName('onit')
    .usage('$0 <cmd> [args]')
    // NOTE: the help message is auto-translated based on OS language. No need to change it.
    .option('h', { alias: 'help' })
    // THose are global parameters valid everywhere
    .option('verbose', { describe: 'Enable verbose log', type: 'boolean' })
    .option('nerd', { hidden: true })
    .option('log-to-file', { describe: 'Save output to log file', type: 'boolean' })
    .option('experimental-network-inspection', { describe: 'Same as node --experimental-network-inspection', type: 'boolean' })
    .version(false)
    .command('$0', '', (yargs) => {
    yargs.option('v', { alias: 'version', describe: 'Show version', type: 'boolean' });
}, (argv) => {
    // Mostra la versione se richiesto
    if (argv.v) {
        logger_1.logger.log(packageJson_1.packageJson.version);
        return;
    }
    // mostrami se non ci sono altri comandi
    (0, header_1.header)();
});
//# sourceMappingURL=main.js.map