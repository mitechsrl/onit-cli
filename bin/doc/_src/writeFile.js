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

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

/**
 * replace the [@onitSrc filePath] with the content of filepath, using proper code tags
 * @param {*} str
 * @param {*} chapters
 * @returns
 */
const resolveSourceIncludes = (block, str) => {
    // resolve reference links
    const regex = /\[@onitSrc +([^ \]]+) *([^ \]]+)? *(.*)?\]/gm;
    let m;

    while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        const found = m[0]; // all the matched piece of code
        let file = m[1]; // file path relative to block.filePath to be included
        const transformFunction = m[2]; // apply this function to the text before adding to the docs
        const params = m[3]; // apply this function to the text before adding to the docs

        file = path.join(block.filePath, '../', file);
        if (fs.existsSync(file)) {
            let replace = '';

            const fileContent = fs.readFileSync(file).toString();
            if (transformFunction) {
                const transformFunctionPath = path.join(__dirname, './includeTransforms/', './' + transformFunction);
                try {
                    const fn = require(transformFunctionPath);
                    replace = fn(fileContent, params);
                } catch (e) {
                    console.warn('Transform of ' + found + ' failed, error:' + e);
                }
            } else {
                const ext = path.extname(file).replace('.', '');
                replace = '```' + ext + '\n' + fileContent + '\n```';
            }

            str = str.replace(found, replace);
        }
    }
    return str;
};

/**
 * Replace internal reference links with marktown links
 * @param {*} str
 * @param {*} chapters
 * @returns
 */
const resolveInternalReferences = (str, chapters) => {
    // resolve reference links
    const regex = /\[@onitChapter +([0-9.]+)(#[^\]]+)?\](\([^)]+\))?/gm;
    let m;

    while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        const found = m[0]; // all the matched piece of code
        const chapter = m[1]; // chapter number
        const anchor = m[2] || ''; // anchor

        let text = m[3] || ''; // link text.
        if (text.startsWith('(')) text = text.substr(1);
        if (text.endsWith(')')) text = text.substr(0, text.length - 1);

        const referenceChapter = m[1].replace(/\./g, '/');
        const referenceTitle = ((chapters[chapter] || {}).title || '').replace(/ /g, '-');

        // build the link. We must build it as we need on the final page because jackill is not going to process it
        const referencePath = '/docs/' + referenceChapter + '/' + referenceTitle + '.html' + anchor;
        if (!text) text = referencePath;

        // this is a markdown link format
        const replace = '[' + text + '](' + referencePath + ')';

        // console.log('Resolved', found, 'to', replace);
        str = str.replace(found, replace);
    }
    return str;
};

/**
 * Generate a block markdown
 *
 * @param {*} block
 * @returns
 */
const generateBlock = (block, chapters) => {
    let str = '';

    block.doc = block.doc.trim();

    if (!block.doc.startsWith('#')) {
        switch (block.titleFormat) {
        case 'h3': str += '#'; break;
        case 'h4': str += '##'; break;
        }
        str += '## ' + block.title + '\n\n';
    }

    str += block.doc + '\n\n';

    if (block.params.length > 0) {
        str += '#### Params\n';
    }

    block.params.forEach(param => {
        str += '##### **' + param.name + '**\n';
        param.source.forEach(s => {
            s.tokens.start = '';
            s.tokens.delimiter = '';
            s.tokens.end = '';
            s.tokens.tag = '';
            s.tokens.type = '';
            s.tokens.name = '';
            s.tokens.postDelimiter = s.tokens.postDelimiter.split('').slice(1).join('');
        });
        str += param.source.map(s => s.tokens.postDelimiter + s.tokens.description).join('\n');
        str += '\n\n';
    });

    // resolve the internal links for better navigation
    str = resolveInternalReferences(str, chapters);

    // resolve source include tags
    str = resolveSourceIncludes(block, str);

    return str;
};

const reduceJekillHeader = (acc, e) => {
    if (typeof e === 'string') acc = acc + '\n' + e;
    if (Array.isArray(e)) acc = acc + '\n' + e[0] + ': ' + e[1];
    return acc.trim();
};

function createFile (filename, header, content = '') {
    const jekillHeader = [
        '---',
        ['layout', 'page'],
        ...Object.entries(header || {}),
        '---'
    ].reduce(reduceJekillHeader, '');

    fs.writeFileSync(filename, jekillHeader + content);
}

/**
 * Build the page content
 * @param {*} blocks
 * @param {*} chapterKey
 * @returns
 */
function buildContent (blocks, chapterKey, chapters) {
    // add extracted blocks markdown
    if (blocks.chapters[chapterKey]) {
        // sort them
        blocks.chapters[chapterKey].sort((a, b) => a.priority - b.priority);
        // merge all the blocks for this chapter into a "mega arkdown text"
        return blocks.chapters[chapterKey].map(block => generateBlock(block, chapters)).join('\n\n');
    }

    return '';
}

/**
 * Write ot parsed files
 * @param {*} blocks
 */
const writeFile = function (configFile, blocks, scanTargetDir, outDir) {
    const chapterKeys = Object.keys(configFile.chapters);
    chapterKeys.sort();

    chapterKeys.forEach(chapter => {
        // precalc chapters keys
        const chapterKey = chapter;
        const parentChapterKey = chapterKey.split('.').slice(0, -1).join('.');
        const grandParentChapterKey = parentChapterKey.split('.').slice(0, -1).join('.');

        // precal chapter configs
        const chapterConfig = configFile.chapters[chapterKey];
        const parentChapterConfig = parentChapterKey ? configFile.chapters[parentChapterKey] : null;
        const grandParentChapterConfig = grandParentChapterKey ? configFile.chapters[grandParentChapterKey] : null;

        // calculate the destination directory file
        const fileDir = path.resolve(outDir, './' + chapterKey.split('.').join('/'));

        // remove the previous file
        fse.removeSync(fileDir);

        // ensure we have the destination folder
        fs.mkdirSync(fileDir, { recursive: true });

        // automatically add index in case of "children chapters"
        if (chapterKeys.some(k => k.startsWith(chapterKey + '.'))) {
            chapterConfig.index = chapterConfig.index || {};
        }

        // this chapter defines a index configuration. Add the 'index.md' file
        if (chapterConfig.index) {
            chapterConfig.index.title = chapterConfig.title;
            const indexFullPath = path.join(fileDir, 'index.md');

            // setup the "has_children" key by checking if we have defined sub-chapters
            if (chapterKeys.some(k => k.startsWith(chapterKey + '.'))) {
                chapterConfig.index.has_children = 'true';
            }

            // setup hierarchy references
            if (parentChapterConfig) chapterConfig.index.parent = parentChapterConfig.title;
            if (grandParentChapterConfig) chapterConfig.index.grand_parent = grandParentChapterConfig.title;

            // create the index content
            const chapterFileContent = buildContent(blocks, chapterKey, configFile.chapters);

            // write the file out
            createFile(indexFullPath, chapterConfig.index, '\n\n\n' + chapterFileContent);

            return; // do not add other stuff to this page
        }

        // automatically add a page if we have some blocks for it
        if (blocks.chapters[chapterKey]) {
            chapterConfig.page = chapterConfig.page || {};
        }

        // create the page config
        if (chapterConfig.page) {
            chapterConfig.page.title = chapterConfig.title;

            // setup hierarchy references
            if (parentChapterConfig) chapterConfig.page.parent = parentChapterConfig.title;
            if (grandParentChapterConfig) chapterConfig.page.grand_parent = grandParentChapterConfig.title;

            // create the page content
            const chapterFileContent = buildContent(blocks, chapterKey);

            // write the file out
            const fileFullPath = path.join(fileDir, chapterConfig.title.replace(/[^a-zA-Z0-9]/g, '-') + '.md');
            createFile(fileFullPath, chapterConfig.page, '\n\n\n' + chapterFileContent);
        }
    });
};

module.exports = {
    writeFile: writeFile
};
