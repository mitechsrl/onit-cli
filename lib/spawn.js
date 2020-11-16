const { spawn } = require('child_process');
const logger = require('./logger');

module.exports = (cmd, params, print) => {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, params);

        let _data = Buffer.from('');
        proc.stdout.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (print !== false) { logger.rawLog(data.toString()); }
        });

        proc.stderr.on('data', (data) => {
            _data = Buffer.concat([_data, data]);
            if (print !== false) { logger.rawLog(data.toString()); }
        });

        proc.on('close', (code) => {
            return resolve(code, _data.toString());
        });

        proc.on('error', (err) => {
            return reject(err);
        });
    });
};

