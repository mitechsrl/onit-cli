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

import crypto, { Encoding } from 'crypto';
import { SshTargetPassword } from '../types';

/**
 * Encrypt a plain text string and return the encrypted object.
 *
 * @param {*} privateKey The private key to encrypt data. Must be generated with generatePrivateKey or something else but it must match the required lenght
 * @param {*} plainTextData The plain test string to be encoded
 * @param {*} encoding  The encoding format. Default to hex
 *
 * @returns The returned object is an object made of two elements: iv (init vector) and encryptedData. Both value are needed to perform a decrypt.
 */
export function encrypt(privateKey: crypto.BinaryLike, plainTextData: string, encoding?: Encoding) {
    const _encoding = encoding ?? 'hex';
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(privateKey, 'nein_nein_nein_nein!', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainTextData, 'utf-8', _encoding);
    encrypted += cipher.final(_encoding);
    return { algo: 'aes-256-cbc', iv: iv.toString(_encoding), encryptedData: encrypted } as SshTargetPassword;
}

/**
 * Decrypt an encrypted data string and return the plain text result
 *
 * @param {*} initVector The init vector (encoded in *encoding* format) string created by the ancrypt function
 * @param {*} privateKey The private key to decrypt data
 * @param {*} encryptedData The encoded string to be decoded
 * @param {*} encoding The format of initVector and encryptedData. Default to hex
 */
export function decrypt(initVector: string, privateKey: string, encryptedData: string, encoding?: Encoding) {
    const _encoding = encoding ?? 'hex';
    const iv = Buffer.from(initVector, 'hex');
    const key = crypto.scryptSync(privateKey, 'nein_nein_nein_nein!', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, _encoding ?? 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
