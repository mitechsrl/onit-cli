import { GenericObject } from '../../../../types';
import { Translator, TranslatorResponse } from './Translator';
export declare class AzureTranslator implements Translator {
    private config;
    constructor(config: GenericObject);
    private longToShort;
    private shortToLong;
    translate(text: string, fromLangCode: string, toLangCodes: string[]): Promise<TranslatorResponse>;
}
