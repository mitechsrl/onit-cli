"use strict";
/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Encrypt a plain text string and return the encrypted object.
 *
 * @param {*} privateKey The private key to encrypt data. Must be generated with generatePrivateKey or something else but it must match the required lenght
 * @param {*} plainTextData The plain test string to be encoded
 * @param {*} encoding  The encoding format. Default to hex
 *
 * @returns The returned object is an object made of two elements: iv (init vector) and encryptedData. Both value are needed to perform a decrypt.
 */
function encrypt(privateKey, plainTextData, encoding) {
    const _encoding = encoding !== null && encoding !== void 0 ? encoding : 'hex';
    const iv = crypto_1.default.randomBytes(16);
    const key = crypto_1.default.scryptSync(privateKey, 'nein_nein_nein_nein!', 32);
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainTextData, 'utf-8', _encoding);
    encrypted += cipher.final(_encoding);
    return { algo: 'aes-256-cbc', iv: iv.toString(_encoding), encryptedData: encrypted };
}
exports.encrypt = encrypt;
/**
 * Decrypt an encrypted data string and return the plain text result
 *
 * @param {*} initVector The init vector (encoded in *encoding* format) string created by the ancrypt function
 * @param {*} privateKey The private key to decrypt data
 * @param {*} encryptedData The encoded string to be decoded
 * @param {*} encoding The format of initVector and encryptedData. Default to hex
 */
function decrypt(initVector, privateKey, encryptedData, encoding) {
    const _encoding = encoding !== null && encoding !== void 0 ? encoding : 'hex';
    const iv = Buffer.from(initVector, 'hex');
    const key = crypto_1.default.scryptSync(privateKey, 'nein_nein_nein_nein!', 32);
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, _encoding !== null && _encoding !== void 0 ? _encoding : 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
exports.decrypt = decrypt;
//# sourceMappingURL=crypto.js.map