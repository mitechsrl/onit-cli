import { TranslationServiceClient } from '@google-cloud/translate';
import { fileSync } from 'tmp';
import { GenericObject } from '../../../../types';
import { Translator, TranslatorResponse } from './Translator';
import fs from 'fs';

/**
 * Google based translator.
 * Uses google api to translate a text.
 * NOTE: this requires a valid google cloud subscription, which is required to create the needed credentials
 */
export class GoogleTranslator implements Translator{

    private config: GenericObject;
    private translationClient: TranslationServiceClient|undefined = undefined;
    private tmpfile;
    constructor(config: GenericObject){
        this.config = config;
        // TranslationServiceClient wants a json config file path.
        // Creating a temporary file with data
        this.tmpfile = fileSync({ postfix: '.json' });
        fs.writeFileSync(this.tmpfile.fd, config.applicationCredentials);
        process.env.GOOGLE_APPLICATION_CREDENTIALS = this.tmpfile.name;
        this.translationClient = new TranslationServiceClient();
    }

    // run at the end of translate
    public async shutdown(){
        this.translationClient = undefined;
        // is this is not working??
        this.tmpfile.removeCallback();       
    }

    // google needs 2-char codes
    private longToShort(longLangCode:string){
        return longLangCode.substring(0,2);
    }

    async translate(text: string, fromLangCode: string, toLangCodes: string[]): Promise<TranslatorResponse> {
        const result: TranslatorResponse = {};

        for(const lc of toLangCodes){
            // Run request
            const response = await this.translationClient!.translateText({
                parent: 'projects/'+this.config.projectId+'/locations/'+this.config.location,
                contents: [text],
                mimeType: 'text/plain',
                sourceLanguageCode: this.longToShort(fromLangCode),
                targetLanguageCode: this.longToShort(lc)
            });

            // [{"translations":[{"translatedText":"Off","model":"","glossaryConfig":null,"detectedLanguageCode":""}],"glossaryTranslations":[]},null,null]
            response.forEach((t: GenericObject|undefined) => {
                t?.translations.forEach((translated: GenericObject) => {
                    result[lc] = translated.translatedText;
                });
            });
        }
        
        return result;
    }
}