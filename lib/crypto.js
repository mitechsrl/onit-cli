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

'use strict';

/**
 * Helper functions to crypt & drcrypt data using node crypto library
 */

const _crypto = require('crypto');

module.exports = {

    /**
     * Encrypt a plain text string and return the encrypted object.
     *
     * @param {*} privateKey The private key to encrypt data. Must be generated with generatePrivateKey or something else but it must match the required lenght
     * @param {*} plainTextData The plain test string to be encoded
     * @param {*} encoding  The encoding format
     *
     * @returns The returned object is an object made of two elements: iv (init vector) and encryptedData. Both value are needed to perform a decrypt.
     */
    encrypt: function (privateKey, plainTextData, encoding = 'hex') {
        const iv = _crypto.randomBytes(16);
        const key = _crypto.scryptSync(privateKey, 'nein_nein_nein_nein!', 32);
        const cipher = _crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(plainTextData, 'utf-8', encoding);
        encrypted += cipher.final(encoding);
        return { algo: 'aes-256-cbc', iv: iv.toString(encoding), encryptedData: encrypted };
    },

    /**
     * Decrypt an encrypted data string and return the plain text result
     *
     * @param {*} initVector The init vector (encoded in *encoding* format) string created by the ancrypt function
     * @param {*} privateKey The private key to decrypt data
     * @param {*} encryptedData The encoded string to be decoded
     * @param {*} encoding The format of initVector and encryptedData. Default to hex
     */
    decrypt: function (initVector, privateKey, encryptedData, encoding = 'hex') {
        const iv = Buffer.from(initVector, 'hex');
        const key = _crypto.scryptSync(privateKey, 'nein_nein_nein_nein!', 32);
        var decipher = _crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedData, encoding, 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    }
};
