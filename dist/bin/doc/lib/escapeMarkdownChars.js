"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdownChars = void 0;
/**
 * Some chars are misinterpreted by markdown. This escape them.
 * @param {*} str
 * @returns
 */
function escapeMarkdownChars(str) {
    const regex = /([<>|_])/gm;
    const subst = '\\$1';
    return str.replace(regex, subst);
}
exports.escapeMarkdownChars = escapeMarkdownChars;
//# sourceMappingURL=escapeMarkdownChars.js.map