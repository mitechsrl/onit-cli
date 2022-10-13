import yargs from 'yargs';
import { header } from '../lib/header';
import { logger } from '../lib/logger';
import { packageJson } from '../lib/packageJson';

export const cli = yargs.scriptName('mitech')
    .usage('$0 <cmd> [args]')
    .option('h', { alias: 'help' })
    .option('verbose', { describe: 'Enable verbose log' })
    .version(false)
    .command('$0', '',
        (yargs) => {
            yargs.option('v', { alias: 'version', describe: 'Show version' });
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
