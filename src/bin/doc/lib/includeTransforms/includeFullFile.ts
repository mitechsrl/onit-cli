import { extname } from 'path';
import yargs from 'yargs';

export default class IncludeFullFileParser {
    /**
     *
     * @param src the file content
     * @param type
     * @returns the full file as markdowncode block
     */
    parse (src:string, filename:string, argv: yargs.ArgumentsCamelCase<unknown>) {
        const fileType = extname(filename).replace(/[.]/, '').toLowerCase() || 'ts';

        return '```' + fileType + '\n' + src + '\n' + '```';
    }
}

