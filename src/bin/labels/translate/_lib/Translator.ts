import { GenericObject } from '../../../../types';

export type TranslatorResponse = {
    [langCode: string]: string;
};

export interface Translator {
    translate(text: string, fromLangCode:string, toLangCode:string[]): Promise<TranslatorResponse>
}