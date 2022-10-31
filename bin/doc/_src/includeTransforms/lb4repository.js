const ts = require('typescript');

/**
 * Convert a property object to markdown
 *
 * @param {*} property
 * @returns
 */
function renderPropertyMarkdown (property) {
    // do not output private methods
    if (property.private) return '';

    // Create the output
    const content = [];
    const titleBadges = [];
    if (property.private) titleBadges.push("<span class='badge badge-red'><b>Private</b></span>");
    if (property.public) titleBadges.push("<span class='badge badge-green'><b>Public</b></span>");
    if (property.protected) titleBadges.push("<span class='badge badge-yellow'><b>Protected</b></span>");
    if (property.static) titleBadges.push("<span class='badge badge-gray'><b>Static</b></span>");
    if (property.async) titleBadges.push("<span class='badge badge-gray'><b>Async</b></span>");

    content.push(`#### ${property.name} <span class='member-type'>${property.type}</span> ${titleBadges.join(' ')}`);
    content.push(property.comment.join('\n'));

    return content.join('\n');
}

/**
 * Convert a method object to markdown
 * @param {*} method
 * @returns
 */
function renderMethodMarkdown (method) {
    // do not output private methods
    if (method.private) return '';

    // Create the output
    const content = [];

    const titleBadges = [];
    if (method.private) titleBadges.push("<span class='badge badge-red'><b>Private</b></span>");
    if (method.public) titleBadges.push("<span class='badge badge-green'><b>Public</b></span>");
    if (method.protected) titleBadges.push("<span class='badge badge-yellow'><b>Protected</b></span>");
    if (method.static) titleBadges.push("<span class='badge badge-gray'><b>Static</b></span>");
    if (method.async) titleBadges.push("<span class='badge badge-gray'><b>Async</b></span>");

    content.push(`### ${method.name} ${titleBadges.join(' ')}`);
    if (method.comment.length) {
        content.push(method.comment.join('\n'));
    }
    if (method.params.length > 0) {
        content.push('#### Params');

        method.params.forEach(param => {
            content.push(`**${param.name}** _${param.type}_\n{: .mb-0 }`);
            if (param.comment) {
                content.push(`${param.comment.trim()}\n{: .mx-3 .my-0 }`);
            }
        });
    }

    if (method.returns) {
        content.push('#### Returns');
        content.push(method.returns);
    }

    return content.join('\n');
}

/**
 * Render repository markdown
 *
 * @param {*} properties
 * @param {*} methods
 * @returns
 */
function renderMarkdown (properties, methods) {
    const _final = [];
    if (properties.length) {
        _final.push('## Properties');
        properties.forEach(p => _final.push(renderPropertyMarkdown(p)));
    }
    if (methods.length) {
        _final.push('## Methods');
        methods.forEach(p => _final.push(renderMethodMarkdown(p)));
    }
    return _final.join('\n');
}

module.exports = (src, params) => {
    // parse the typescript file
    const node = ts.createSourceFile(
        'repository.ts',
        src, // sourceText
        ts.ScriptTarget.ES2018
    );

    const properties = [];
    const methods = [];

    function processProperty (n) {
        const property = {
            name: n.name.escapedText,
            type: src.substring(n.type.pos, n.type.end).trim().replace(/['"’\r\n]/g, '').replace(/ +/g, ' '),
            comment: [],
            public: false,
            private: false,
            protected: false,
            static: false
        };

        (n.modifiers || []).forEach(modifier => {
            switch (modifier.kind) {
            case ts.SyntaxKind.PublicKeyword: property.public = true; break;
            case ts.SyntaxKind.PrivateKeyword: property.private = true; break;
            case ts.SyntaxKind.ProtectedKeyword: property.protected = true; break;
            case ts.SyntaxKind.StaticKeyword: property.static = true; break;
            }
        });

        (n.jsDoc || []).forEach(comment => {
            property.comment.push(comment.comment.escapedText);
        });

        return property;
    }

    function processMethodDeclaration (n) {
        const method = {
            public: false,
            private: false,
            protected: false,
            static: false,
            async: false,
            name: n.name.escapedText,
            params: [],
            comment: [],
            return: ''
        };

        (n.modifiers || []).forEach(modifier => {
            switch (modifier.kind) {
            case ts.SyntaxKind.AsyncKeyword: method.async = true; break;
            case ts.SyntaxKind.PublicKeyword: method.public = true; break;
            case ts.SyntaxKind.PrivateKeyword: method.private = true; break;
            case ts.SyntaxKind.ProtectedKeyword: method.protected = true; break;
            case ts.SyntaxKind.StaticKeyword: method.static = true; break;
            }
        });

        (n.parameters || []).forEach(p => {
            const params = {
                name: src.substring(p.name.pos, p.name.end).trim(),
                type: src.substring(p.type.pos, p.type.end).trim().replace(/['"’\r\n]/g, '').replace(/ +/g, ' '),
                comment: ''
            };

            method.params.push(params);
        });

        (n.jsDoc || []).forEach(comment => {
            method.comment.push(comment.escapedText);

            (comment.tags || []).forEach(t => {
                const tagName = src.substring(t.tagName.pos, t.tagName.end).trim();
                switch (tagName) {
                case 'param': {
                    const paramName = src.substring(t.name.pos, t.name.end).trim();
                    const comment = t.comment;
                    if (comment) {
                        const _p = method.params.find(p => p.name === paramName);
                        if (_p) {
                            _p.comment = comment;
                        }
                    }
                    break;
                }
                case 'returns': method.return = t.comment;
                    break;
                }
            });
        });
        return method;
    }

    // process class declarations
    node.forEachChild(child => {
        if (child.kind === ts.SyntaxKind.ClassDeclaration) {
            child.members.forEach(n => {
                if (n.name) {
                    if (n.kind === ts.SyntaxKind.PropertyDeclaration) {
                        properties.push(processProperty(n));
                    }
                    if (n.kind === ts.SyntaxKind.MethodDeclaration) {
                        methods.push(processMethodDeclaration(n));
                    }
                }
            });
        }
    });

    // render the final repo markdown
    return renderMarkdown(properties, methods);
};
