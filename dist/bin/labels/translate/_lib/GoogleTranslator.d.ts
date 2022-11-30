import { GenericObject } from '../../../../types';
import { Translator, TranslatorResponse } from './Translator';
export declare class GoogleTranslator implements Translator {
    private config;
    private translationClient;
    private tmpfile;
    constructor(config: GenericObject);
    shutdown(): Promise<void>;
    private longToShort;
    private shortToLong;
    translate(text: string, fromLangCode: string, toLangCodes: string[]): Promise<TranslatorResponse>;
}
