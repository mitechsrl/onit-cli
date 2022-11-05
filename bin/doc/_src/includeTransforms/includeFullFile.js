const path = require('path');

class IncludeFullFileParser {
    /**
     *
     * @param src the file content
     * @param type
     * @returns the full file as markdowncode block
     */
    parse (src, filename, params) {
        const fileType = path.extname(filename).replace(/[.]/, '').toLowerCase() || 'ts';

        return '```' + fileType + '\n' + src + '\n' + '```';
    };
}

// This file MUST export ProcessorClass since it is managed automatically by other scripts
module.exports.ProcessorClass = IncludeFullFileParser;
