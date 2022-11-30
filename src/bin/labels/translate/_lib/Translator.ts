export type TranslatorResponse = {
    [langCode: string]: string;
};

export interface Translator {
    translate(text: string, fromLangCode:string, toLangCode:string[]): Promise<TranslatorResponse>

    // run at the end of translate
    shutdown(): Promise<void>
}