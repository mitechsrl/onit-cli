import yargs from 'yargs';
import { header } from '../lib/header';
import { logger } from '../lib/logger';
import { packageJson } from '../lib/packageJson';

export const cli = yargs.scriptName('onit')
    .usage('$0 <cmd> [args]')
    // NOTE: the help message is auto-translated based on OS language. No need to change it.
    .option('h', { alias: 'help' })
    // THose are global parameters valid everywhere
    .option('verbose', { describe: 'Enable verbose log', type: 'boolean' })
    .option('nerd', { hidden: true })
    .option('log-to-file', { describe: 'Save output to log file' , type: 'boolean' })
    .version(false)
    .command('$0', '',
        (yargs) => {
            yargs.option('v', { alias: 'version', describe: 'Show version', type: 'boolean' });
        },
        (argv) => {
            // Mostra la versione se richiesto
            if (argv.v) {
                logger.log(packageJson.version);
                return;
            }
            // mostrami se non ci sono altri comandi
            header();
        }
    );
