/**
 * Create the json commands report file
 * This script is called at build time
 */

import { writeFileSync } from 'fs';
import path from 'path';
import { ScanCommandResult, scanCommands } from './scanCommands';

/**
 * Script chiamato dopo la build per generare json dei comandi
 */
scanCommands(path.join(process.cwd(), './dist/bin'), '')
    .then((commands: ScanCommandResult[]) => {
        const file = path.join(__dirname,'../../dist/commands.json');
        writeFileSync(file, JSON.stringify(commands, null, 4));
    });

