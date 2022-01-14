
const NEWLINE = '\n';

/**
 * 
 * @param {string} src the file content 
 * @param {*} type
 * @returns 
 */
module.exports = (src, type) => {

    const fileType = type || 'ts';

    return '```' + fileType + NEWLINE + src + NEWLINE + '```';
}