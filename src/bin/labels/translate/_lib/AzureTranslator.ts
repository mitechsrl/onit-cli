import axios from 'axios';
import { GenericObject } from '../../../../types';
import { Translator, TranslatorResponse } from './Translator';
import { v4 as uuidv4 } from 'uuid';

/**
 * Microsoft Azure based translator
 * 
 * Note: requires a valid azure subscription and a translator resource, in which you should find your api key.
 */
export class AzureTranslator implements Translator{

    private config: GenericObject;
    constructor(config: GenericObject){
        this.config = config;
    }

    // azure support only 2-char codes
    private longToShort(longLangCode:string){
        return longLangCode.substring(0,2);
    }

    // convert 2-char codes to original iso codes
    private shortToLong(shortCode:string, longCodes: string[]){
        const long = longCodes.find(l => l.startsWith(shortCode));
        if (long) return long;

        return shortCode+'_'+shortCode.toUpperCase();
    }

    async translate(text: string, fromLangCode: string, toLangCodes: string[]): Promise<TranslatorResponse> {
        
        const result: TranslatorResponse = {};
        const key = this.config.key;
        const endpoint = 'https://api.cognitive.microsofttranslator.com';
        const location = this.config.location;

        const response = await axios({
            baseURL: endpoint,
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                // location required if you're using a multi-service or regional (not global) resource.
                'Ocp-Apim-Subscription-Region': location,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            params: {
                'api-version': '3.0',
                'from': this.longToShort(fromLangCode),
                'to': toLangCodes.map(l=> this.longToShort(l))
            },
            data: [{
                'text': text
            }],
            responseType: 'json'
        });

        // Questo ciclo??
        response.data.forEach((t:GenericObject) => t.translations.forEach((t: GenericObject)=> {
            result[this.shortToLong(t.to, toLangCodes)]=t.text;
        }));

        return result;
    }

    // run at the end of translate
    public async shutdown(){
        return;
    }
}