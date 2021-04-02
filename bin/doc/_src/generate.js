const { parse, stringify } = require('comment-parser/lib');
var glob = require('glob-all');
var fs = require('fs');
const writeFile = require('./writeFile');

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
            './**/*.js',
            './**/*.jsx',
            './**/*.md',
            ...(config.globList || [])
        ];

        logger.log('Scanning target directories...');
        glob(globList, options, function (er, files) {
            // files is an array of filenames.
            // If the `nonull` option is set, and nothing
            // was found, then files is ["**/*.js"]
            // er is an error object or null.

            const blocks = {
                chapters: {}
            };
            files.forEach(file => {
                logger.log('Processing ' + file);
                const commentBlocks = parse(fs.readFileSync(file).toString());

                commentBlocks.forEach(block => {
                    const onitBlock = {};

                    const onitDoc = block.tags.find(t => t.tag === 'onitDoc');
                    if (!onitDoc) return;

                    let start = '';
                    onitDoc.source.forEach(s => {
                        if (s.tokens.tag === '@onitDoc') start = s.tokens.start;
                        s.tokens.start = s.tokens.start.replace(new RegExp('^' + start), '');
                        s.tokens.end = '';
                        s.tokens.tag = '';
                        s.tokens.delimiter = '';
                    });
                    onitBlock.doc = stringify(onitDoc);

                    const onitChapter = block.tags.find(t => t.tag === 'onitChapter');
                    if (onitChapter) {
                        onitBlock.chapter = onitChapter.name;
                    } else {
                        return;
                    }

                    const onitTitle = block.tags.find(t => t.tag === 'onitTitle');
                    if (onitTitle) {
                        onitBlock.title = onitTitle.name + ' ' + onitTitle.description;
                    }

                    const onitType = block.tags.find(t => t.tag === 'onitType');
                    if (onitType) {
                        onitBlock.type = onitType.name + ' ' + onitType.description;
                    }

                    const params = block.tags.filter(b => b.tag === 'param');
                    onitBlock.params = onitBlock.params || [];
                    onitBlock.params.push(...params);

                    blocks.chapters[onitBlock.chapter] = blocks.chapters[onitBlock.chapter] || [];
                    blocks.chapters[onitBlock.chapter].push(onitBlock);
                });
            });

            logger.log('Writing out...');
            writeFile.writeFile(config, blocks, outputPath);
            resolve();
        });
    });
};
// console.log(extract.file('some-file.js'), { cwd: 'some/path' });

