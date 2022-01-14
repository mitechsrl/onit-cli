const ts = require('typescript');
const NEWLINE = '\n';
module.exports = (src, params) => {
    const node = ts.createSourceFile(
        'somefile.ts', // fileName
        src, // sourceText
        ts.ScriptTarget.Latest // langugeVersion
    );

    const content = ['## Model properties and relations'];
    node.forEachChild(child => {
        if (ts.SyntaxKind[child.kind] === 'ClassDeclaration') {
            child.members.forEach(n => {
                if (n.name) {
                    let str = '##### ' + n.name.escapedText + NEWLINE + NEWLINE;

                    (n.decorators || []).forEach(d => {
                        str = str + '```ts' + NEWLINE + src.substring(d.expression.pos, d.expression.end) + NEWLINE + '```' + NEWLINE + NEWLINE;
                    });

                    content.push(str);
                }
            });
        }
    });

    return content.join('\n');
}