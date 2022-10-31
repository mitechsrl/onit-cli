/**
 *
 * @param {string} src the file content
 * @param {*} type
 * @returns
 */
module.exports = (src, type) => {
    const fileType = type || 'ts';

    return '```' + fileType + '\n' + src + '\n' + '```';
};
