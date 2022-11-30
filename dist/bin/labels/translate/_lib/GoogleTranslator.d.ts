import { GenericObject } from '../../../../types';
import { Translator, TranslatorResponse } from './Translator';
/**
 * Google based translator.
 * Uses google api to translate a text.
 * NOTE: this requires a valid google cloud subscription, which is required to create the needed credentials
 */
export declare class GoogleTranslator implements Translator {
    private config;
    private translationClient;
    private tmpfile;
    constructor(config: GenericObject);
    shutdown(): Promise<void>;
    private longToShort;
    translate(text: string, fromLangCode: string, toLangCodes: string[]): Promise<TranslatorResponse>;
}
