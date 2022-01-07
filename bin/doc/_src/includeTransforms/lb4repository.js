const ts = require('typescript');
const stripComments = require('strip-comments');

const NEWLINE = '\n';

/**
 * Parse modifiers string to enhance some of its components.
 * @param {*} str
 * @returns
 */
function modifiersParser (str) {
    if (!str) return '';
    const components = stripComments(str).split(' ').map(c => c.trim()).filter(c => !!c).map(c => {
        switch (c.toLowerCase()) {
            case 'private': return '<span class=\'badge badge-red\'><b>Private</b></span>';
            case 'public': return '<span class=\'badge badge-green\'><b>Public</b></span>';
            case 'protected': return '<span class=\'badge badge-yellow\'><b>Protected</b></span>';
        }
        return '<span class=\'badge badge-gray\'><b>' + c + '</b></span>';
    });
    return {
        str: components.join(' '),
        isPrivate: !!str.match(/.*private.*/gis)
    };
}

module.exports = (src, params) => {
    // parse the typescript file
    const node = ts.createSourceFile(
        'repository.ts',
        src, // sourceText
        ts.ScriptTarget.Latest
    );

    const properties = [];
    const methods = [];

    function processProperty (n) {
        let str = '#### ' + n.name.escapedText + NEWLINE;
        if (n.modifiers) {
            const modifiers = modifiersParser(src.substring(n.modifiers.pos, n.modifiers.end));
            if (!modifiers.isPrivate) {
                if (modifiers.str) {
                    str += modifiers.str + ' ';
                }
                str += n.type.typeName.escapedText + NEWLINE;

                (n.jsDoc || []).forEach(comment => {
                    str = str + comment.comment + NEWLINE;
                });
                properties.push(str);
            }
        }
    }

    function processMethodDeclaration (n) {
        if (n.modifiers) {
            const modifiers = modifiersParser(src.substring(n.modifiers.pos, n.modifiers.end));
            if (!modifiers.isPrivate) {
                const str = '#### ' + n.name.escapedText + NEWLINE;
                const params = [];
                (n.parameters || []).forEach(param => {
                    const p = src.substring(param.pos, param.end);
                    params.push(p.trim());
                });
                let type = '';
                if (n.type) {
                    type = ': ' + src.substring(n.type.pos, n.type.end);
                }
                const head = n.name.escapedText + '(' + params.join(', ') + ')' + type;
                let jsDoc = '';

                // process the method jsdoc tag
                (n.jsDoc || []).forEach(comment => {
                    jsDoc = jsDoc + (comment.comment || '') + NEWLINE;
                    const params = [];
                    let returnValue = '';
                    (comment.tags || []).forEach(t => {
                        if (t.tagName.escapedText === 'param') {
                            params.push('*' + t.name.escapedText + '*: ' + (t.comment ? t.comment : 'TODO'));
                        }
                        if (t.tagName.escapedText === 'return' && t.comment) {
                            returnValue = t.comment;
                        }
                    });
                    if (params.length > 0) {
                        jsDoc += NEWLINE + '##### Parameters' + NEWLINE + NEWLINE + params.join(NEWLINE + NEWLINE) + NEWLINE + NEWLINE;
                    }
                    if (returnValue) {
                        jsDoc += '##### Return value' + NEWLINE + returnValue;
                    }
                });
                methods.push(str + NEWLINE + modifiers.str + NEWLINE + '```ts' + NEWLINE + head + NEWLINE + '```' + NEWLINE + NEWLINE + jsDoc + NEWLINE);
            }
        }
    }

    // process class declarations
    node.forEachChild(child => {
        if (ts.SyntaxKind[child.kind] === 'ClassDeclaration') {
            child.members.forEach(n => {
                if (n.name) {
                    if (ts.SyntaxKind[n.kind] === 'PropertyDeclaration') {
                        processProperty(n);
                    }
                    if (ts.SyntaxKind[n.kind] === 'MethodDeclaration') {
                        processMethodDeclaration(n);
                    }
                }
            });
        }
    });

    const _final = [];
    if (properties.length) {
        _final.push('### Properties', ...properties);
    }

    if (methods.length) {
        _final.push('### Methods ', ...methods);
    }

    return _final.join(NEWLINE);
};
