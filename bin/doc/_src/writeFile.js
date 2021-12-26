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
 * get an array of nodes which leads from root to the label-marked node.
 * @param {*} config
 * @param {*} label
 * @returns
 */
function getChapterBranchByLabel(config, label) {
    const _recurse = (n, branch) => {
        let _branch = null;
        n.some((chapter) => {
            if (chapter.label === label) {
                _branch = [...branch, chapter];
                return true;
            } else if (chapter.children) {
                const nb = _recurse(chapter.children, [...branch, chapter]);
                if (nb) {
                    _branch = nb;
                    return true;
                }
            };
            return false;
        });

        return _branch;
    };

    return _recurse(config.chapters, []);
}
/**
 * Replace internal reference links with marktown links
 * @param {*} str
 * @param {*} chapters
 * @returns
 */
const resolveInternalReferences = (str, configFile) => {
    // resolve reference links
    const regex = /\[@onitChapter +([a-zA-Z0-9._1]+)(#[^\]]+)?\](\([^)]+\))?/gm;
    let m;

    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        const found = m[0]; // all the matched piece of code
        const label = m[1]; // label
        const anchor = m[2] || ''; // anchor

        let text = m[3] || ''; // link text.
        if (text.startsWith('(')) text = text.substr(1);
        if (text.endsWith(')')) text = text.substr(0, text.length - 1);

        let referencePath = '';

        // build the link path. Note that pages with the index properties have links like '/LABEL1/LABEL2',
        // while standard pages have links like '/LABEL1/LABEL2/Title.html'
        const branch = getChapterBranchByLabel(configFile, label);
        if (!branch) {
            console.error(branch);
        } else {
            const filePath = branch.reduce((acc, b) => {
                return [...acc, b.chapterIndex + '_' + b.label];
            }, []).join('/');

            if (!branch[branch.length - 1].index) {
                // build the link. We must build it as we need on the final page because jackill is not going to process it
                const referenceTitle = (branch[branch.length - 1].title || '').replace(/ /g, '-');
                referencePath = (configFile.baseUrl || '') + '/docs/' + filePath + '/' + referenceTitle + '.html' + anchor;
            } else {
                referencePath = (configFile.baseUrl || '') + '/docs/' + filePath + anchor;
            }
            if (!text) text = referencePath;

            // this is a markdown link format
            const replace = '[' + text + '](' + referencePath + ')';
            console.log('Generate link ' + replace);
            // console.log('Resolved', found, 'to', replace);
            str = str.replace(found, replace);
        }
    }
    return str;
};

/**
 * Generate a block markdown
 *
 * @param {*} block
 * @returns
 */
const generateBlock = (block, configFile, defaultTitle) => {
    let str = '';

    block.doc = block.doc.trim();

    if (!block.doc.startsWith('#')) {
        switch (block.titleFormat) {
            case 'h3': str += '#'; break;
            case 'h4': str += '##'; break;
        }
        str += '## ' + (block.title || defaultTitle) + '\n\n';
    }

    str += block.doc + '\n\n';

    if (block.params.length > 0) {
        str += '#### Params\n';
    }

    block.params.forEach(param => {
        str += '**' + param.name + '**: ';
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
    str = resolveInternalReferences(str, configFile);

    // resolve source include tags
    str = resolveSourceIncludes(block, str);

    return str;
};

function reduceJekillHeader(acc, e) {
    if (typeof e === 'string') acc = acc + '\n' + e;
    if (Array.isArray(e)) acc = acc + '\n' + e[0] + ': ' + e[1];
    return acc.trim();
};

function createFile(filename, header, content = '') {
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
function buildContent(blocks, chapterConfig, configFile) {
    // add extracted blocks markdown
    if (blocks.chapters[chapterConfig.label]) {
        const defaultTitle = chapterConfig.title;
        // sort them
        blocks.chapters[chapterConfig.label].sort((a, b) => a.priority - b.priority);
        // merge all the blocks for this chapter into a "mega arkdown text"
        return blocks.chapters[chapterConfig.label].map(block => generateBlock(block, configFile, defaultTitle)).join('\n\n');
    }

    return '';
}

/**
 * Write ot parsed files
 * @param {*} blocks
 */
const writeFile = function (configFile, blocks, scanTargetDir, outDir) {
    // recursive function
    const _recurse = (chapters, parent, grandparent) => {
        chapters.forEach((chapterConfig) => {
            const label = chapterConfig.label;

            // calculate the destination directory
            const p = [
                grandparent ? (grandparent.chapterIndex + "_" + (grandparent || {}).label) : null,
                parent ? (parent.chapterIndex + "_" + (parent || {}).label) : null,
                chapterConfig.chapterIndex + '_' + label
            ];

            const fileDir = path.resolve(outDir, './' + p.filter(l => !!l).join('/'));
            fs.mkdirSync(fileDir, { recursive: true });

            // automatically add index in case of "children chapters"
            if ((chapterConfig.children || []).length > 0) {
                chapterConfig.index = chapterConfig.index || {};
                chapterConfig.index.has_children = 'true';
            }

            // this chapter defines a index configuration. Add the 'index.md' file
            if (chapterConfig.index) {
                chapterConfig.index.title = chapterConfig.title;
                const indexFullPath = path.join(fileDir, 'index.md');

                // setup hierarchy references
                if (parent) chapterConfig.index.parent = parent.title;
                if (grandparent) chapterConfig.index.grand_parent = grandparent.title;

                // create the index content
                const chapterFileContent = buildContent(blocks, chapterConfig, configFile);

                // write the file out
                createFile(indexFullPath, chapterConfig.index, '\n\n\n' + chapterFileContent);
            }

            // do not add page content for indexes
            if (!chapterConfig.index) {
                // automatically add a page if we have some blocks for it
                if (blocks.chapters[chapterConfig.label]) {
                    chapterConfig.page = chapterConfig.page || {};
                }

                // create the page config
                if (chapterConfig.page) {
                    chapterConfig.page.title = chapterConfig.title;

                    // setup hierarchy references
                    if (parent) chapterConfig.page.parent = parent.title;
                    if (grandparent) chapterConfig.page.grand_parent = grandparent.title;

                    // create the page content
                    const generatedFileContent = buildContent(blocks, chapterConfig, configFile);

                    // h4 must not appear on file toc
                    const regex = /^(####.+)$/gm;
                    const subst = '$1\n{: .no_toc}\n';

                    const chapterFileContent = '1. TOC\n{:toc}\n---\n' + generatedFileContent.replace(regex, subst);

                    // write the file out
                    const fileFullPath = path.join(fileDir, chapterConfig.title.replace(/[^a-zA-Z0-9]/g, '-') + '.md');
                    createFile(fileFullPath, chapterConfig.page, '\n\n\n' + chapterFileContent);
                }
            }

            // recurse on children
            if (chapterConfig.children) {
                _recurse(chapterConfig.children, chapterConfig, parent);
            }
        });
    };

    // Ensure we have the target dir empty
    fse.removeSync(outDir);

    _recurse(configFile.chapters, null, null);
};

module.exports = {
    writeFile: writeFile
};
