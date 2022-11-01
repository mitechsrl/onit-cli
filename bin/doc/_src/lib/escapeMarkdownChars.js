/**
 * Some chars are misinterpreted by markdown. This escape them.
 * @param {*} str
 * @returns
 */
function escapeMarkdownChars (str) {
    const regex = /([<>|_])/gm;
    const subst = '\\$1';
    return str.replace(regex, subst);
}

module.exports.escapeMarkdownChars = escapeMarkdownChars;
