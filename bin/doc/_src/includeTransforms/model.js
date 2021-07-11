/**
 * Preprocess the model json to return a md-formatted configuration.
 * @param {string} src content of the json file
 * @param {string} params any other paream after the file in the onitSrc tag
 * @returns string
 */
module.exports = (src, params) => {
    const json = JSON.parse(src);

    let str = '**Model properties**\n';
    str += '```json\n' + JSON.stringify(json.properties, null, 2) + '\n```\n\n';
    str += '**Model relations**\n';
    str += '```json\n' + JSON.stringify(json.relations, null, 2) + '\n```\n\n';

    return str;
};
