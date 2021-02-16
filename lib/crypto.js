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
