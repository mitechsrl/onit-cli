"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
class IncludeFullFileParser {
    /**
     *
     * @param src the file content
     * @param type
     * @returns the full file as markdowncode block
     */
    parse(src, filename, argv) {
        const fileType = (0, path_1.extname)(filename).replace(/[.]/, '').toLowerCase() || 'ts';
        return '```' + fileType + '\n' + src + '\n' + '```';
    }
}
exports.default = IncludeFullFileParser;
//# sourceMappingURL=includeFullFile.js.map