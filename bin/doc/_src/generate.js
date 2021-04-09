
var glob = require('glob-all');
var fs = require('fs');
const writeFile = require('./writeFile');
const path = require('path');

module.exports.generate = function (config, outputPath, logger) {
    return new Promise((resolve, reject) => {
        const options = {
            ignore: [
                './node_modules/**/*',
                './extras/**/*',
                './build/**/*',
                './assets/**/*',
                './dist/**/*',
                './dist-fe/**/*',
                './docs/**/*',
                './onit-doc/**/*',
                './test/**/*',
                ...(config.ignore || [])
            ]
        };

        const globList = [
            { extension: '.js', glob: './**/*.js', parser: path.join(__dirname, './parsers/javascript.js') },
            { extension: '.jsx', glob: './**/*.jsx', parser: path.join(__dirname, './parsers/javascript.js') },
            { extension: '.md', glob: './**/*.md', parser: path.join(__dirname, './parsers/markdown.js') },
            ...(config.globList || [])
        ];

        const _globList = globList.map(g => g.glob || g);
        logger.log('Scanning target directories...');
        glob(_globList, options, function (er, files) {
            // files is an array of filenames.
            // If the `nonull` option is set, and nothing
            // was found, then files is ["**/*.js"]
            // er is an error object or null.

            let blocks = {
                chapters: {}
            };
            files.forEach(file => {
                logger.log('Processing ' + file);
                const fileContent = fs.readFileSync(file).toString();
                const globType = globList.find(g => file.endsWith(g.extension || '$failthisextension$'));

                // default parser
                let parser = globType ? globType.parser : path.join(__dirname, './parsers/javascript.js');
                parser = require(parser);
                blocks = parser.parse(fileContent, blocks);
            });

            logger.log('Writing out...');
            writeFile.writeFile(config, blocks, outputPath);
            resolve();
        });
    });
};
// console.log(extract.file('some-file.js'), { cwd: 'some/path' });

