const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const inquirer = require('inquirer');
const crypto = require('./crypto');

// check from local file
const localFiles = [
    path.join(process.cwd(), '.mitechcli'),
    path.join(process.cwd(), '.mitechcli.json'),
    path.join(process.cwd(), '../.mitechcli'),
    path.join(process.cwd(), '../.mitechcli.json'),
    path.join(process.cwd(), '../../.mitechcli'),
    path.join(process.cwd(), '../../.mitechcli.json')
];

/**
 * get the targets list from the first of the localFiles found
 */
const list = function () {
    return localFiles.reduce((found, localFile) => {
        if (found !== null) return found;

        if (fs.existsSync(localFile)) {
            let file = fs.readFileSync(localFile).toString();
            try {
                file = JSON.parse(file);
                if (file.targets) return { file: localFile, targets: file.targets };
                return null;
            } catch (e) {
                logger.error(e);
                return null;
            }
        }
        return null;
    }, null);
};

module.exports.list = list;

const get = async function () {
    const targetsList = list();
    if (!targetsList || targetsList.targets.length === 0) return null;
    if (targetsList.targets.length === 1) return targetsList.targets[0];

    logger.info('Uso file: ' + targetsList.file);

    var questions = [{
        type: 'list',
        name: 'target',
        message: 'Seleziona target: ',
        choices: targetsList.targets.map(item => ({ name: item.name, value: item }))
    }];
    const answers = await inquirer.prompt(questions);
    const _t = answers.target;

    // must decode password before using
    if (_t.accessType === 'password') {
        _t.password = crypto.decrypt(_t.password.iv, process.env.MitechCliEncryptionKey, _t.password.encryptedData);
    }
    return _t;
};

module.exports.get = get;

const print = (target) => {
    if (!target) {
        logger.warn('Nessun target correntemente attivo');
        logger.log('Usa <mitech ssh target add> per crearne uno, oppure <mitech ssh target set> per usarne uno già creato');
    } else {
        logger.info('Target corrente: ' + target.name + ' ' + target.host);

        // logger.log(JSON.stringify(_.omit(target, ['password', 'activate']), null, 4));
    }
    logger.log('');
};

module.exports.print = print;
