"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureTranslator = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
class AzureTranslator {
    constructor(config) {
        this.config = config;
    }
    // azure support only 2-char codes
    longToShort(longLangCode) {
        return longLangCode.substring(0, 2);
    }
    // convert 2-char codes to original iso codes
    shortToLong(shortCode, longCodes) {
        const long = longCodes.find(l => l.startsWith(shortCode));
        if (long)
            return long;
        return shortCode + '_' + shortCode.toUpperCase();
    }
    async translate(text, fromLangCode, toLangCodes) {
        const result = {};
        const key = this.config.key;
        const endpoint = 'https://api.cognitive.microsofttranslator.com';
        const location = this.config.location;
        const response = await (0, axios_1.default)({
            baseURL: endpoint,
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                // location required if you're using a multi-service or regional (not global) resource.
                'Ocp-Apim-Subscription-Region': location,
                'Content-type': 'application/json',
                'X-ClientTraceId': (0, uuid_1.v4)().toString()
            },
            params: {
                'api-version': '3.0',
                'from': this.longToShort(fromLangCode),
                'to': toLangCodes.map(l => this.longToShort(l))
            },
            data: [{
                    'text': text
                }],
            responseType: 'json'
        });
        // Questo ciclo??
        response.data.forEach((t) => t.translations.forEach((t) => {
            result[this.shortToLong(t.to, toLangCodes)] = t.text;
        }));
        return result;
    }
    // run at the end of translate
    async shutdown() {
        return;
    }
}
exports.AzureTranslator = AzureTranslator;
//# sourceMappingURL=AzureTranslator.js.map