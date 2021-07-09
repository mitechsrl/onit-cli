const fs = require('fs');
const path = require('path');

function copyImages (config, blocks, scanTargetDir, outputPath) {
    // match for ![text](link)
    const regex = /!\[([^\]]+)\]\(([^)]+)\)/gm;

    Object.values(blocks.chapters).forEach(chapterBlocks => {
        chapterBlocks.forEach(block => {
            const str = block.doc;
            let m;
            while ((m = regex.exec(str)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                const found = m[0];
                const text = m[1];
                const srcPath = m[2];
                const dst = path.join(outputPath, './images/', srcPath);
                const markdownDst = path.join('/docs/images/', srcPath);
                if (fs.existsSync(srcPath)) {
                    fs.mkdirSync(path.dirname(dst), { recursive: true });
                    fs.copyFileSync(path.join(scanTargetDir, srcPath), dst);
                    // console.log('[IMAGE] copy ' + srcPath + ' to ' + dst);

                    const replace = '![' + text + '](' + markdownDst + ')';
                    block.doc = block.doc.replace(found, replace);
                }
            }
        });
    });
}

module.exports.copyImages = copyImages;
