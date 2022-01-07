/*
Copyright (c) 2021 Mitech S.R.L.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

const glob = require('glob-all');
const fs = require('fs');
const writeFile = require('./writeFile');
const path = require('path');
const copyImages = require('./copyImages');
const logger = require('../../../lib/logger');

module.exports.generate = function (config, outputPath) {

    // set the indexes in the tree objects so later we can use them more easily
    const _recurseSetIndex = (tree) => {
        tree.forEach((t, i) => {
            t.chapterIndexNumber = i;
            if (t.children) {
                _recurseSetIndex(t.children);
            }
        });
    };
    _recurseSetIndex(config.chapters);


    const scanTargetDir = process.cwd();

    return new Promise((resolve, reject) => {
        const options = {
            ignore: [
                './node_modules/**/*',
                './dist/**/*',
                ...(config.ignore || [])
            ]
        };

        // setup which files must be parsed and the relative parser. See https://en.wikipedia.org/wiki/Glob_(programming) for glob patterns
        const globList = [
            { extension: '.js', glob: ['./**/*.js', './**/*.JS'], parser: path.join(__dirname, './parsers/javascript.js') },
            { extension: '.ts', glob: ['./**/*.ts', './**/*.TS'], parser: path.join(__dirname, './parsers/javascript.js') },
            { extension: '.jsx', glob: ['./**/*.jsx', './**/*.JSX'], parser: path.join(__dirname, './parsers/javascript.js') },
            { extension: '.md', glob: ['./**/*.md', './**/*.MD'], parser: path.join(__dirname, './parsers/markdown.js') },
            ...(config.globList || []) // add globs from config file
        ];

        // create a unique glob list for the glob package
        const _globList = globList.filter(g => g.glob) // skip empty globs for.... reasons
            .reduce((a, g) => {
                a.push(...(Array.isArray(g.glob) ? g.glob : [g.glob]));
                return a;
            }, []);

        logger.log('Scanning target directories...');
        glob(_globList, options, function (er, files) {
            // files is an array of filenames. If the `nonull` option is set, and nothing was found, then files is ["**/*.js"]
            if (er) return reject(er);

            let blocks = {
                chapters: {}
            };
            files.forEach(file => {
                logger.log('Processing ' + file);
                const fileContent = fs.readFileSync(file).toString();
                const globType = globList.find(g => file.toLowerCase().endsWith(g.extension.toLowerCase() || '$failthisextension$'));

                // default parser
                let parser = globType ? globType.parser : path.join(__dirname, './parsers/javascript.js');
                parser = require(parser);
                blocks = parser.parse(fileContent, file, blocks);
            });

            const outDir = path.resolve(process.cwd(), outputPath.found ? outputPath.value : './onit-doc/');
            logger.log('Create out directory: ' + outDir);
            fs.mkdirSync(outDir, { recursive: true });

            logger.log('Copying images...');
            copyImages.copyImages(config, blocks, scanTargetDir, outDir);

            logger.log('Writing files...');
            writeFile.writeFile(config, blocks, scanTargetDir, outDir);

            resolve();
        });
    });
};

