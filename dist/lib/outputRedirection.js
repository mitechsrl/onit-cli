"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeOutputRedirection = exports.setupOutputRedirection = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./logger");
const filename = path_1.default.join(process.cwd(), 'onit-cli-log-' + (new Date()).toISOString().replace(/[:.]/g, '-') + '.log');
let writeStream = null;
let isOpen = false;
/**
 *
 * @param {*} tag A geeric tag string
 * @param {*} data array of data to be print to log
 */
function appendToLog(tag, data) {
    if (writeStream) {
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
}
/**
 * Create a console proxy to write data to a file stream
 * @returns
 */
async function setupOutputRedirection() {
    return new Promise((resolve, reject) => {
        writeStream = fs_1.default.createWriteStream(filename);
        writeStream.on('open', function () {
            isOpen = true;
            // Monkey patching the exit method 
            // to ensure the output file is closed if someone ever call process.exit from now on
            const _exit = process.exit;
            // @ts-expect-error ignoring nevr return type
            process.exit = (code) => {
                closeOutputRedirection();
                _exit(code);
            };
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
            isOpen = false;
            reject(e);
        });
    });
}
exports.setupOutputRedirection = setupOutputRedirection;
/**
 * Close the write stream to file
 */
function closeOutputRedirection() {
    if (writeStream) {
        // close the stream
        writeStream.end();
    }
    if (isOpen) {
        logger_1.logger.log('');
        logger_1.logger.debug('Log file: ' + filename);
    }
    isOpen = false;
}
exports.closeOutputRedirection = closeOutputRedirection;
//# sourceMappingURL=outputRedirection.js.map