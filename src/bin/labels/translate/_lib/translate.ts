import fs from 'fs';
import { logger } from '../../../../lib/logger';
import { GenericObject, OnitConfigFile, OnitConfigFileTranslate, StringError } from '../../../../types';
import { LabelFileInfo, scanLabelsFiles } from '../../_lib/scanLabelsFiles';
import { AzureTranslator } from './AzureTranslator';
import { Translator } from './Translator';
import { dirname }from 'path';
import { supportedTranslationProviders } from './supportedTranslationProviders';
import { GoogleTranslator } from './GoogleTranslator';
import _ from 'lodash';

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
async function translateLabelSet(
    labels: OnitLabelConfig[], 
    languageCodes: string[], 
    translator: Translator,
    translate?: OnitConfigFileTranslate
): Promise<OnitLabelConfig[]>{
    
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
        
        // dont translate the skipped ones
        if (isSkipped(original, translate)){
            missingLanguages.forEach(langCode => {
                const newLabel = Object.assign({}, original);
                newLabel.language = langCode;
                finalLabelSet.push(newLabel);
            });
            continue;
        }
        
        original = replaceSynonm(original, translate);

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
function replaceSynonm(label: OnitLabelConfig, translate?: OnitConfigFileTranslate){
    label = _.cloneDeep(label);
    // yup. Hardcoded synonms.
    // These are here to be retrocompatible with another tool used before.
    const synonmsFromConfigFile = (translate?.synomns && Array.isArray(translate.synomns)) ? translate?.synomns : [];
    const synonms = [...synonmsFromConfigFile,
        { 'word':'collo','syn':'pacco' },
        { 'word':'colli','syn':'pacchi' },
        { 'word':'bolla','syn':'bolletta' },
        { 'word':'bolle','syn':'bollette' },
        { 'word':'mezzo','syn':'veicolo' },
        { 'word':'mezzi','syn':'veicoli' },
        { 'word':'ritiro','syn':'raccolta' },
        { 'word':'ritiri','syn':'raccolte' },
        { 'word':'errore', 'syn':'error' } // or it will translated as "mitake"
    ];
    
    const pieces = label.text.split(' ').map(p => {
        const s = synonms.find(s => s.word.toLowerCase() === p.toLowerCase());
        if (!s) return p;

        // trie to maintain upper/lowecase chars
        if (_.upperFirst(p) === p) return _.upperFirst(s.syn);
        if (_.lowerCase(p) === p) return _.lowerCase(s.syn);
        if (_.upperCase(p) === p) return _.upperCase(s.syn);

        return s.syn;
    });
    label.text = pieces.join(' ');
    
    return label;
}

/**
 * 
 * @param labels 
 * @param translate 
 * @returns 
 */
function isSkipped(label: OnitLabelConfig, translate?: OnitConfigFileTranslate){

    const skipFromConfigFile = (translate?.skip && Array.isArray(translate?.skip)) ? translate.skip: [];

    // hardcoded values just to be compatible with a previous used tool
    const skip = [
        ...skipFromConfigFile,
        'Error',
        'Errore',
        'Alert',
        'Nz',
        'CC'
    ];

    const lcSkip = skip.map(s => s.toLowerCase());
    return lcSkip.includes(label.text.toLowerCase());
    
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
 * @param onitConfigFile The config file content
 * @param translator 
 * @param languageCodes 
 * @returns 
 */
async function processFile(file: LabelFileInfo, onitConfigFile: OnitConfigFile, translator: Translator, languageCodes: string[]){
    logger.log('Processing '+file.filename);
    const srcLabels = file.content.labels;

    // launch translation on this file label set
    const labels = await translateLabelSet(srcLabels, languageCodes, translator, onitConfigFile.json.translate);

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
    const languageCodes = onitConfigFile.json.translate?.languages ?? ['en_GB','de_DE','fr_FR','es_ES'];
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