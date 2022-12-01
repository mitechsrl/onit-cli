import fs from 'fs';
import { logger } from '../../../../lib/logger';
import { GenericObject, OnitConfigFile, OnitConfigFileTranslate, StringError } from '../../../../types';
import { LabelFileInfo, scanLabelsFiles } from '../../_lib/scanLabelsFiles';
import { AzureTranslator } from './AzureTranslator';
import { Translator } from './Translator';
import { dirname }from 'path';
import { supportedTranslationProviders } from './supportedTranslationProviders';
import { GoogleTranslator } from './GoogleTranslator';

type OnitLabelConfig = {
    'language': string,
    'label': string
    'text': string,
    'page': string
};

/**
 * Some translators does not handle very well "%s". This fixes them.
 * 
 * @param str 
 * @returns 
 */
function fixPercentS(str:string){
    str = str.replace('% s','%s');
    str = str.replace('% S','%s');
    return str;
}

/**
 * Takes a set of labels as input and return an addidional set of trnslated labels
 * @param labels source OnitLabelConfig[]
 * @param languageCodes 
 * @param translator 
 * @returns array of new OnitLabelConfig. 
 */
async function translateLabelSet(labels: OnitLabelConfig[], languageCodes: string[], translator: Translator): Promise<OnitLabelConfig[]>{
    
    const finalLabelSet: OnitLabelConfig[] = [];

    // group them by page+label
    const groups = labels.reduce((acc: { [k:string]: OnitLabelConfig[] }, item: OnitLabelConfig) => {
        acc[item.page+'-'+item.label] = acc[item.page+'-'+item.label] ?? [];
        acc[item.page+'-'+item.label].push(item);
        return acc;
    },{}) as { [k:string]: OnitLabelConfig[] };
    
    for (const groupKey of Object.keys(groups)){
        // for each group get the missing translations (langcodes) 
        const group = groups[groupKey];
        const missingLanguages = languageCodes.filter((code:string) => {
            return !group.find(l => l.language === code);
        });
        
        // do nothing in case all the translations are available
        if (missingLanguages.length === 0) continue;

        // get one of the available translations to be used as start text to be
        // translated later
        let original = group.find(l => l.language === 'it_IT');
        if (!original) original = group.find(l => l.language === 'en_GB');
        if (!original) original = group[0];
        // no entry avilable??
        if (!original) continue;

        logger.log(`Translating <${original.text}> to ${missingLanguages.join(', ')}`);

        // launch the trnslator function
        // this will translate text in the missing languages
        const translated = await translator.translate(original.text, original.language, missingLanguages );
        
        Object.keys(translated).forEach(langCode => {
            const newLabel = Object.assign({}, original);
            newLabel.language=langCode;
            const text = fixPercentS(translated[langCode]);
            newLabel.text = text;
            finalLabelSet.push(newLabel);
        });
    }

    return finalLabelSet;
        
}

/**
 * 
 * @param v 
 * @returns 
 */
function buildSortKey(v: OnitLabelConfig) {
    return v.label+v.language;
}

/**
 * Replaces text pieces in labels.
 * Some translations get wrong words, this tries to fix them by using synonm 
 * 
 * @param labels 
 * @param translate 
 * @returns 
 */
function replaceSynonm(labels: OnitLabelConfig[], translate?: OnitConfigFileTranslate){
    if (!translate?.synomns) return labels;
    
    labels.forEach(l => {
        const pieces = l.text.split(' ').map(p => {
            const s = translate.synomns?.find(s => s.word === p);
            if (!s) return p;
            return s.syn;
        });
        l.text = pieces.join(' ');
    });
    return labels;
}

/**
 * Filter out from labels array the ones whose text matches one of the "skip" string from translate config.
 * 
 * @param labels 
 * @param translate 
 * @returns 
 */
function removeSkipped(labels: OnitLabelConfig[], translate?: OnitConfigFileTranslate){
    if (!translate?.skip) return labels;
    if (translate.skip.length === 0) return labels;

    return labels.filter(l => {
        return !(translate.skip?.includes(l.text));
    });
}

/**
 * Create  translator class instance
 * 
 * @param serviceConfig 
 * @returns 
 */
function createTranslatorInstance(serviceConfig: GenericObject){
    switch(serviceConfig.provider){
    case 'azure': 
        return new AzureTranslator(serviceConfig);
    case 'google': 
        return new GoogleTranslator(serviceConfig);
    default: throw new StringError('Unknown translator provider '+serviceConfig.provider+'. Supported: '+supportedTranslationProviders.map(p => p.provider).join(', '));
    }
}

/**
 * Process a single labels file
 * 
 * @param file 
 * @param onitConfigFile 
 * @param translator 
 * @param languageCodes 
 * @returns 
 */
async function processFile(file: LabelFileInfo, onitConfigFile: OnitConfigFile, translator: Translator, languageCodes: string[]){
    logger.log('Processing '+file.filename);
    let srcLabels = file.content.labels;

    srcLabels = replaceSynonm(srcLabels, onitConfigFile.json.translate);
    srcLabels = removeSkipped(srcLabels, onitConfigFile.json.translate);

    // launch translation on this file label set
    const labels = await translateLabelSet(srcLabels, languageCodes, translator);

    // do we have new translations??
    if (labels.length>0){
        // yes, add them to file              
        file.content.labels.push(...labels);

        // Sort labels, this will make git merges easier
        file.content.labels.sort((a: OnitLabelConfig,b: OnitLabelConfig)=>{
            const sortKeyA = buildSortKey(a);
            const sortKeyB = buildSortKey(b);
            if (sortKeyA === sortKeyB) return 0;
            return (sortKeyA < sortKeyB) ? -1: 1;
        });

        fs.writeFileSync(file.filename,JSON.stringify(file.content, null, 4));

    }
}

/**
 * 
 * @param dir 
 * @param languageCodes 
 * @returns 
 */
export async function translate(onitConfigFile: OnitConfigFile, serviceConfig: GenericObject){
    // get the languages to translate to. A minimal default set is used
    const languageCodes = onitConfigFile.json.translate?.languages ?? ['it_IT','en_GB'];
    const dir = dirname(onitConfigFile.sources[0]);
    // et all the labels files and their content
    const files = await scanLabelsFiles(dir);
    
    let translator: Translator|null = null;
    try{
        translator = createTranslatorInstance(serviceConfig);
        for (const file of files){
            await processFile(file, onitConfigFile, translator, languageCodes);
        }
        await translator.shutdown();
    }catch(error){
        if (translator) await translator.shutdown();
        throw error; 
    }
}