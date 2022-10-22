import path from 'path';
import fs from 'fs';
import { GenericObject } from '../types';
import { logger } from './logger';

const filename = path.join(process.cwd(), 'onit-cli-log-' + (new Date()).toISOString().replace(/[:.]/g, '-') + '.log');
let writeStream: fs.WriteStream | null = null;

/**
 *
 * @param {*} tag A geeric tag string
 * @param {*} data array of data to be print to log
 */
function appendToLog (tag: string, data: GenericObject[]) {
    const strings = data.map((d, index) => {
        try {
            if (typeof d === 'string') return d;
            return JSON.stringify(d);
        } catch (e) {
            return `[param ${index} not convertible to json]`;
        }
    });

    writeStream?.write(tag + strings.join(' ') + '\n');
}

/**
 * Create a console proxy to write data to a file stream
 * @returns 
 */
export async function setupOutputRedirecion(): Promise<void>{
    return new Promise((resolve, reject) => {
        writeStream = fs.createWriteStream(filename);
        writeStream.on('open', function (fd) {
            const methods = ['error', 'info', 'log', 'warn'];
            const maxLength = 1 + Math.max(...methods.map(m => m.length));

            methods.forEach(methodName => {
                // @ts-expect-error console
                const nativeMethod = console[methodName];
                // @ts-expect-error console
                console[methodName] = (...args: any[]) => {
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
export async function closeOutputRedirction(){
    if (writeStream) {
        // close the stream
        writeStream.end();
    }

    logger.log('');
    logger.debug('Log file: ' + filename);
};

