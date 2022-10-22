"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeOutputRedirction = exports.setupOutputRedirecion = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./logger");
const filename = path_1.default.join(process.cwd(), 'onit-cli-log-' + (new Date()).toISOString().replace(/[:.]/g, '-') + '.log');
let writeStream = null;
/**
 *
 * @param {*} tag A geeric tag string
 * @param {*} data array of data to be print to log
 */
function appendToLog(tag, data) {
    const strings = data.map((d, index) => {
        try {
            if (typeof d === 'string')
                return d;
            return JSON.stringify(d);
        }
        catch (e) {
            return `[param ${index} not convertible to json]`;
        }
    });
    writeStream === null || writeStream === void 0 ? void 0 : writeStream.write(tag + strings.join(' ') + '\n');
}
/**
 * Create a console proxy to write data to a file stream
 * @returns
 */
async function setupOutputRedirecion() {
    return new Promise((resolve, reject) => {
        writeStream = fs_1.default.createWriteStream(filename);
        writeStream.on('open', function (fd) {
            const methods = ['error', 'info', 'log', 'warn'];
            const maxLength = 1 + Math.max(...methods.map(m => m.length));
            methods.forEach(methodName => {
                // @ts-expect-error console
                const nativeMethod = console[methodName];
                // @ts-expect-error console
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
}
exports.setupOutputRedirecion = setupOutputRedirecion;
;
/**
 * Close the write stream to file
 */
async function closeOutputRedirction() {
    if (writeStream) {
        // close the stream
        writeStream.end();
    }
    logger_1.logger.log('');
    logger_1.logger.debug('Log file: ' + filename);
}
exports.closeOutputRedirction = closeOutputRedirction;
;
//# sourceMappingURL=outputRedirection.js.map