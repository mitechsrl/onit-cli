import { GenericObject } from '../../../../types';
import { Translator, TranslatorResponse } from './Translator';
/**
 * Microsoft Azure based translator
 *
 * Note: requires a valid azure subscription and a translator resource, in which you should find your api key.
 */
export declare class AzureTranslator implements Translator {
    private config;
    constructor(config: GenericObject);
    private longToShort;
    private shortToLong;
    translate(text: string, fromLangCode: string, toLangCodes: string[]): Promise<TranslatorResponse>;
    shutdown(): Promise<void>;
}
