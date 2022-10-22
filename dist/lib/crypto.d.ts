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
/// <reference types="node" />
import crypto, { HexBase64BinaryEncoding } from 'crypto';
/**
 * Encrypt a plain text string and return the encrypted object.
 *
 * @param {*} privateKey The private key to encrypt data. Must be generated with generatePrivateKey or something else but it must match the required lenght
 * @param {*} plainTextData The plain test string to be encoded
 * @param {*} encoding  The encoding format. Default to hex
 *
 * @returns The returned object is an object made of two elements: iv (init vector) and encryptedData. Both value are needed to perform a decrypt.
 */
export declare function encrypt(privateKey: crypto.BinaryLike, plainTextData: string, encoding?: HexBase64BinaryEncoding): {
    algo: string;
    iv: string;
    encryptedData: string;
};
/**
 * Decrypt an encrypted data string and return the plain text result
 *
 * @param {*} initVector The init vector (encoded in *encoding* format) string created by the ancrypt function
 * @param {*} privateKey The private key to decrypt data
 * @param {*} encryptedData The encoded string to be decoded
 * @param {*} encoding The format of initVector and encryptedData. Default to hex
 */
export declare function decrypt(initVector: string, privateKey: string, encryptedData: string, encoding?: HexBase64BinaryEncoding): string;
