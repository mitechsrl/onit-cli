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
/**
 * Some translators change "%s" in "% s", which breaks string replacements.
 * Resetting it.
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
async function translateLabelSet(labels, languageCodes, translator) {
    const finalLabelSet = [];
    const groups = labels.reduce((acc, item) => {
        var _a;
        acc[item.page + '-' + item.label] = (_a = acc[item.page + '-' + item.label]) !== null && _a !== void 0 ? _a : [];
        acc[item.page + '-' + item.label].push(item);
        return acc;
    }, {});
    for (const groupKey of Object.keys(groups)) {
        const group = groups[groupKey];
        const missingTranslations = languageCodes.filter((code) => {
            return !group.find(l => l.language === code);
        });
        // do nothing in case all the translations are available
        if (missingTranslations.length === 0)
            continue;
        let original = group.find(l => l.language === 'it_IT');
        if (!original)
            original = group.find(l => l.language === 'en_GB');
        if (!original)
            original = group[0];
        if (!original)
            continue;
        logger_1.logger.log(`Translating <${original.text}> to ${missingTranslations.join(', ')}`);
        const translated = await translator.translate(original.text, original.language, missingTranslations);
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
function buildSortKey(v) {
    return v.label + v.language;
}
/**
 * Replaces text pieces in labels
 *
 * @param labels
 * @param translate
 * @returns
 */
function replaceSynonm(labels, translate) {
    if (!(translate === null || translate === void 0 ? void 0 : translate.synomns))
        return labels;
    labels.forEach(l => {
        const pieces = l.text.split(' ').map(p => {
            var _a;
            const s = (_a = translate.synomns) === null || _a === void 0 ? void 0 : _a.find(s => s.word === p);
            if (!s)
                return p;
            return s.syn;
        });
        l.text = pieces.join(' ');
    });
    return labels;
}
/**
 * Filter out from labels array the ones whose text matches one of the "skip" string from translate config.
 * @param labels
 * @param translate
 * @returns
 */
function removeSkipped(labels, translate) {
    if (!(translate === null || translate === void 0 ? void 0 : translate.skip))
        return labels;
    if (translate.skip.length === 0)
        return labels;
    return labels.filter(l => {
        var _a;
        return !((_a = translate.skip) === null || _a === void 0 ? void 0 : _a.includes(l.text));
    });
}
/**
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
 * @param onitConfigFile
 * @param translator
 * @param languageCodes
 * @returns
 */
async function processFile(file, onitConfigFile, translator, languageCodes) {
    logger_1.logger.log('Processing ' + file.filename);
    let srcLabels = file.content.labels;
    srcLabels = replaceSynonm(srcLabels, onitConfigFile.json.translate);
    srcLabels = removeSkipped(srcLabels, onitConfigFile.json.translate);
    // launch translation on this file label set
    const labels = await translateLabelSet(srcLabels, languageCodes, translator);
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
    const languageCodes = (_b = (_a = onitConfigFile.json.translate) === null || _a === void 0 ? void 0 : _a.languages) !== null && _b !== void 0 ? _b : ['it_IT', 'en_GB', 'de_DE', 'es_ES', 'fr_FR'];
    const dir = (0, path_1.dirname)(onitConfigFile.sources[0]);
    const files = await (0, scanLabelsFiles_1.scanLabelsFiles)(dir);
    // create a translator instance
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