"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../../lib/logger");
const types_1 = require("../../../../types");
const scanLabelsFiles_1 = require("../../_lib/scanLabelsFiles");
const AzureTranslator_1 = require("./AzureTranslator");
const path_1 = require("path");
const supportedTranslationProviders_1 = require("./supportedTranslationProviders");
const GoogleTranslator_1 = require("./GoogleTranslator");
const lodash_1 = __importDefault(require("lodash"));
/**
 * Some translators does not handle very well "%s". This fixes them.
 *
 * @param str
 * @returns
 */
function fixPercentS(str) {
    str = str.replace('% s', '%s');
    str = str.replace('% S', '%s');
    return str;
}
/**
 * Takes a set of labels as input and return an addidional set of trnslated labels
 * @param labels source OnitLabelConfig[]
 * @param languageCodes
 * @param translator
 * @returns array of new OnitLabelConfig.
 */
async function translateLabelSet(labels, languageCodes, translator, translate) {
    const finalLabelSet = [];
    // group them by page+label
    const groups = labels.reduce((acc, item) => {
        var _a;
        acc[item.page + '-' + item.label] = (_a = acc[item.page + '-' + item.label]) !== null && _a !== void 0 ? _a : [];
        acc[item.page + '-' + item.label].push(item);
        return acc;
    }, {});
    for (const groupKey of Object.keys(groups)) {
        // for each group get the missing translations (langcodes) 
        const group = groups[groupKey];
        const missingLanguages = languageCodes.filter((code) => {
            return !group.find(l => l.language === code);
        });
        // do nothing in case all the translations are available
        if (missingLanguages.length === 0)
            continue;
        // get one of the available translations to be used as start text to be
        // translated later
        let original = group.find(l => l.language === 'it_IT');
        if (!original)
            original = group.find(l => l.language === 'en_GB');
        if (!original)
            original = group[0];
        // no entry avilable??
        if (!original)
            continue;
        // dont translate the skipped ones
        if (isSkipped(original, translate)) {
            missingLanguages.forEach(langCode => {
                const newLabel = Object.assign({}, original);
                newLabel.language = langCode;
                finalLabelSet.push(newLabel);
            });
            continue;
        }
        original = replaceSynonm(original, translate);
        logger_1.logger.log(`Translating <${original.text}> to ${missingLanguages.join(', ')}`);
        // launch the trnslator function
        // this will translate text in the missing languages
        const translated = await translator.translate(original.text, original.language, missingLanguages);
        Object.keys(translated).forEach(langCode => {
            const newLabel = Object.assign({}, original);
            newLabel.language = langCode;
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
function buildSortKey(v) {
    return v.label + v.language;
}
/**
 * Replaces text pieces in labels.
 * Some translations get wrong words, this tries to fix them by using synonm
 *
 * @param labels
 * @param translate
 * @returns
 */
function replaceSynonm(label, translate) {
    label = lodash_1.default.cloneDeep(label);
    // yup. Hardcoded synonms.
    // These are here to be retrocompatible with another tool used before.
    const synonmsFromConfigFile = ((translate === null || translate === void 0 ? void 0 : translate.synomns) && Array.isArray(translate.synomns)) ? translate === null || translate === void 0 ? void 0 : translate.synomns : [];
    const synonms = [...synonmsFromConfigFile,
        { 'word': 'collo', 'syn': 'pacco' },
        { 'word': 'colli', 'syn': 'pacchi' },
        { 'word': 'bolla', 'syn': 'bolletta' },
        { 'word': 'bolle', 'syn': 'bollette' },
        { 'word': 'mezzo', 'syn': 'veicolo' },
        { 'word': 'mezzi', 'syn': 'veicoli' },
        { 'word': 'ritiro', 'syn': 'raccolta' },
        { 'word': 'ritiri', 'syn': 'raccolte' },
        { 'word': 'errore', 'syn': 'error' } // or it will translated as "mitake"
    ];
    const pieces = label.text.split(' ').map(p => {
        const s = synonms.find(s => s.word.toLowerCase() === p.toLowerCase());
        if (!s)
            return p;
        // trie to maintain upper/lowecase chars
        if (lodash_1.default.upperFirst(p) === p)
            return lodash_1.default.upperFirst(s.syn);
        if (lodash_1.default.lowerCase(p) === p)
            return lodash_1.default.lowerCase(s.syn);
        if (lodash_1.default.upperCase(p) === p)
            return lodash_1.default.upperCase(s.syn);
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
function isSkipped(label, translate) {
    const skipFromConfigFile = ((translate === null || translate === void 0 ? void 0 : translate.skip) && Array.isArray(translate === null || translate === void 0 ? void 0 : translate.skip)) ? translate.skip : [];
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
function createTranslatorInstance(serviceConfig) {
    switch (serviceConfig.provider) {
        case 'azure':
            return new AzureTranslator_1.AzureTranslator(serviceConfig);
        case 'google':
            return new GoogleTranslator_1.GoogleTranslator(serviceConfig);
        default: throw new types_1.StringError('Unknown translator provider ' + serviceConfig.provider + '. Supported: ' + supportedTranslationProviders_1.supportedTranslationProviders.map(p => p.provider).join(', '));
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
async function processFile(file, onitConfigFile, translator, languageCodes) {
    logger_1.logger.log('Processing ' + file.filename);
    const srcLabels = file.content.labels;
    // launch translation on this file label set
    const labels = await translateLabelSet(srcLabels, languageCodes, translator, onitConfigFile.json.translate);
    // do we have new translations??
    if (labels.length > 0) {
        // yes, add them to file              
        file.content.labels.push(...labels);
        // Sort labels, this will make git merges easier
        file.content.labels.sort((a, b) => {
            const sortKeyA = buildSortKey(a);
            const sortKeyB = buildSortKey(b);
            if (sortKeyA === sortKeyB)
                return 0;
            return (sortKeyA < sortKeyB) ? -1 : 1;
        });
        fs_1.default.writeFileSync(file.filename, JSON.stringify(file.content, null, 4));
    }
}
/**
 *
 * @param dir
 * @param languageCodes
 * @returns
 */
async function translate(onitConfigFile, serviceConfig) {
    var _a, _b;
    // get the languages to translate to. A minimal default set is used
    const languageCodes = (_b = (_a = onitConfigFile.json.translate) === null || _a === void 0 ? void 0 : _a.languages) !== null && _b !== void 0 ? _b : ['en_GB', 'de_DE', 'fr_FR', 'es_ES'];
    const dir = (0, path_1.dirname)(onitConfigFile.sources[0]);
    // et all the labels files and their content
    const files = await (0, scanLabelsFiles_1.scanLabelsFiles)(dir);
    let translator = null;
    try {
        translator = createTranslatorInstance(serviceConfig);
        for (const file of files) {
            await processFile(file, onitConfigFile, translator, languageCodes);
        }
        await translator.shutdown();
    }
    catch (error) {
        if (translator)
            await translator.shutdown();
        throw error;
    }
}
exports.translate = translate;
//# sourceMappingURL=translate.js.map