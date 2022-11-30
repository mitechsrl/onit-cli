"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleTranslator = void 0;
const translate_1 = require("@google-cloud/translate");
const tmp_1 = require("tmp");
const fs_1 = __importDefault(require("fs"));
class GoogleTranslator {
    constructor(config) {
        this.translationClient = undefined;
        this.config = config;
        // TranslationServiceClient wants a json config file path.
        // Creating a temporary file with data
        this.tmpfile = (0, tmp_1.fileSync)({ postfix: '.json' });
        fs_1.default.writeFileSync(this.tmpfile.fd, config.applicationCredentials);
        process.env.GOOGLE_APPLICATION_CREDENTIALS = this.tmpfile.name;
        this.translationClient = new translate_1.TranslationServiceClient();
    }
    // run at the end of translate
    async shutdown() {
        this.translationClient = undefined;
        // is this is not working??
        this.tmpfile.removeCallback();
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
        for (const lc of toLangCodes) {
            // Run request
            const response = await this.translationClient.translateText({
                parent: 'projects/' + this.config.projectId + '/locations/' + this.config.location,
                contents: [text],
                mimeType: 'text/plain',
                sourceLanguageCode: this.longToShort(fromLangCode),
                targetLanguageCode: this.longToShort(lc)
            });
            // [{"translations":[{"translatedText":"Off","model":"","glossaryConfig":null,"detectedLanguageCode":""}],"glossaryTranslations":[]},null,null]
            response.forEach((t) => {
                t === null || t === void 0 ? void 0 : t.translations.forEach((translated) => {
                    result[lc] = translated.translatedText;
                });
            });
        }
        return result;
        /*
        , (error, result) =>{

            stats.googleTranslateCall++;
            let translatedResultLabel = Object.assign({},label);
            translatedResultLabel.language = config.translateLanguages[idx];
            translatedResultLabel.text = text;
            if(!error){
                    
                    for (const translation of result.translations) {
                    
                        //catch first...
                        if(res.length<=0){
                            res = translation.translatedText;
                            //clean result
                            res = res.replace("% s","%s");
                            res = res.replace("% S","%s");
                            translatedResultLabel.text = res;
                        }
                    }
                    
            }
            translatedLabels.push(translatedResultLabel);
            process.nextTick(()=>{
                translateTextInternal(idx+1)
            });

        });*/
    }
}
exports.GoogleTranslator = GoogleTranslator;
//# sourceMappingURL=GoogleTranslator.js.map