const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const filename = path.join(process.cwd(), 'onit-cli-log-' + (new Date()).toISOString().replace(/[:.]/g, '-') + '.log');
let writeStream = null;

/**
 *
 * @param {*} tag A geeric tag string
 * @param {*} data array of data to be print to log
 */
function appendToLog (tag, data) {
    const strings = data.map((d, index) => {
        try {
            if (typeof d === 'string') return d;
            return JSON.stringify(d);
        } catch (e) {
            return `[param ${index} not convertible to json]`;
        }
    });

    writeStream.write(tag + strings.join(' ') + '\n');
}

/**
 * Create a console proxy to write data to a file stream
 * @returns 
 */
module.exports.setupOutputRedirecion = async () => {
    return new Promise((resolve, reject) => {
        writeStream = fs.createWriteStream(filename);
        writeStream.on('open', function (fd) {
            const methods = ['error', 'info', 'log', 'warn'];
            const maxLength = 1 + Math.max(...methods.map(m => m.length));

            methods.forEach(methodName => {
                const nativeMethod = console[methodName];
                console[methodName] = (...args) => {
                    nativeMethod(...args);
                    appendToLog((methodName + ':').padEnd(maxLength, ' '), args);
                };
            });

            resolve();
        });

        writeStream.on('error', function (e) {
            reject(e);
        });
    });
};

/**
 * Close the write stream to file
 */
module.exports.closeOutputRedirction = () => {
    if (writeStream) {
        // close the stream
        writeStream.end();
    }

    logger.log('');
    logger.debug('Log file: ' + filename);
};

