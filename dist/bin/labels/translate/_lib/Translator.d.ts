export declare type TranslatorResponse = {
    [langCode: string]: string;
};
export interface Translator {
    /**
     * main translation utility
     * @param text The string to be translated
     * @param fromLangCode The language of the text string (format it_IT, en_EN, de_DE etc...)
     * @param toLangCode Array of language codes. Same format of fromLangCode
     */
    translate(text: string, fromLangCode: string, toLangCode: string[]): Promise<TranslatorResponse>;
    /**
     * run at the end of translate
     */
    shutdown(): Promise<void>;
}
