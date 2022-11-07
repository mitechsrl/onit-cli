/**
 * Some chars are misinterpreted by markdown. This escape them.
 * @param {*} str
 * @returns
 */
export function escapeMarkdownChars (str:string) {
    const regex = /([<>|_])/gm;
    const subst = '\\$1';
    return str.replace(regex, subst);
}

