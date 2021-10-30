/*
Copyright (c) 2021 Mitech S.R.L.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

const fs = require('fs');
const path = require('path');
const header = require('../lib/header');
const logger = require('../lib/logger');

/**
 * stampa help del comando corrente
 * @param {*} basepath
 */
const printHelp = function (basepath) {
    // prendi info dai subcomandi
    const cmds = [];
    const dirs = fs.readdirSync(basepath);
    dirs.forEach(dir => {
        const subDir = path.join(basepath, dir);
        if ((!dir.startsWith('_')) && fs.statSync(subDir).isDirectory()) {
            try {
                const _package = require(subDir);
                cmds.push([dir, _package.info]);
            } catch (e) {
                logger.warn('Load di dir fallita.');
            }
        }
    });

    // unisco tutte le righe da stampare
    const _package = require(basepath);
    let help = [...cmds];
    if (help.length > 0) help.push('');
    help = [...help, ..._package.help];
    help.push(['-h', 'Visualizza help comando']);

    // calcola il max di spazi da mettere per formattare correttamente le due colonne
    let max = 0;
    help.forEach(element => {
        if (!Array.isArray(element)) return;
        if (element[0].length > max) { max = element[0].length; }
    });
    max = max + 8;

    if (process.argv.length <= 3) {
        header();
    }

    // stampa le righe
    if (_package.info) {
        if (Array.isArray(_package.info)) {
            logger.debug(_package.info.shift());
            _package.info.forEach(i => logger.log(i));
        } else {
            logger.debug(_package.info);
        }
    }
    console.log(); // una riga di separazione
    help.forEach(element => {
        if (!Array.isArray(element)) {
            // stampa le stringhe cosi come sono
            console.log('  ' + element);
        } else {
            // gli array vanno stampati in due colonne separate da spazi ooportuni
            const tabs = Object.keys(Array.apply(0, Array(max - element[0].length))).map(v => ' ').join('');
            console.log('  ' + element[0] + tabs + element[1]);
        }
    });
};
module.exports.printHelp = printHelp;

/**
 * esegue comando
 *
 * @param {*} basepath
 * @param {*} parameters
 */
const runCmd = async function (basepath, parameters) {
    const _package = require(basepath);

    parameters.get = function (name) {
        const index = this.findIndex(p => p === name);
        if (index < 0) {
            return { found: false, value: null };
        } else {
            return { found: true, value: this[index + 1] };
        }
    };

    await _package.cmd(basepath, parameters);
};

/**
 * Parsing di un path di comando
 * @param {*} basepath
 * @param {*} parameters
 */
const _command = async function (basepath, parameters) {
    // non c'è piu nulla dopo. Notifico di eseguire il comando 'parent'
    const command = parameters[0];
    if (!command) {
        await runCmd(basepath, parameters);
        return;
    }

    // questo è un parametro. Il comando finisce qui, il resto sono parametri. Notifico di eseguire il comando 'parent'
    if (command.startsWith('-h')) {
        printHelp(basepath, parameters);
        return;
    };

    // questo è un parametro. Il comando finisce qui, il resto sono parametri. Notifico di eseguire il comando 'parent'
    if (command.startsWith('-')) {
        await runCmd(basepath, parameters);
        return;
    };

    // _ contiene files riservati
    if (command.startsWith('_')) throw new Error('Comando ' + command + ' non valido (3)');

    // verifico se il comando esiste su fs
    const p = path.join(basepath, command);
    if (!fs.existsSync(p)) {
        const _package = require(basepath);
        if (_package.catchUnimplementedParams) {
            await runCmd(basepath, parameters);
            return;
        } else {
            throw new Error('Comando ' + command + ' inesistente');
        }
    }

    // verifico il comando è una directory e se essa contiene un js valido
    const stat = fs.statSync(p);
    if (stat && stat.isDirectory()) {
        // parsing ricorsivo
        await _command(p, parameters.slice(1));
    } else {
        throw new Error('Comando ' + command + ' non valido (2)');
    }
};

module.exports.command = _command;
