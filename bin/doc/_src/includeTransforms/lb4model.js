const ts = require('typescript');

/**
 * Render model markdown
 * @param {*} classes
 */
function renderModelMarkdown (classes) {
    const content = [];
    classes.forEach(oneClass => {
        content.push('## ' + oneClass.name);
        content.push('### Model properties and relations');
        oneClass.members.forEach(member => {
            const memberProp = function (name) {
                const prop = member.modelProperty.find(p => p.name === name);
                member.modelProperty = member.modelProperty.filter(p => p.name !== name);
                return prop;
            };

            const titleBadges = [];

            const type = memberProp('type');
            if (type) titleBadges.push(`<span class='member-type'>${type.value.replace(/['"’]/g, '')}</span>`);

            const id = memberProp('id');
            if (id && id.value.indexOf('true') >= 0) {
                titleBadges.push("<span class='badge badge-green'><b>ID</b></span>");
            }

            const required = memberProp('required');
            if (required && required.value.indexOf('true') >= 0) {
                titleBadges.push("<span class='badge badge-yellow'><b>Required</b></span>");
            }

            if (member.private) titleBadges.push("<span class='badge badge-red'><b>Private</b></span>");
            if (member.public) titleBadges.push("<span class='badge badge-green'><b>Public</b></span>");
            if (member.protected) titleBadges.push("<span class='badge badge-yellow'><b>Protected</b></span>");
            if (member.static) titleBadges.push("<span class='badge badge-gray'><b>Static</b></span>");

            content.push(`##### ${member.name} ${titleBadges.join(' ')}`);

            const description = memberProp('description');
            if (description > 0) {
                content.push(description.value + '\n');
            }

            member.modelProperty.forEach(p => {
                content.push(`${p.name}: ${p.value}`);
            });

            if (member.modelPropertyRaw) {
                content.push('```ts\n' + member.modelPropertyRaw + '\n```\n\n');
            }
        });
    });
    return content.join('\n');
}

module.exports = (src, params) => {
    const node = ts.createSourceFile(
        'somefile.ts', // fileName
        src, // sourceText
        ts.ScriptTarget.ES2018 // langugeVersion
    );

    const classes = [];
    node.forEachChild(child => {
        if (child.kind === ts.SyntaxKind.ClassDeclaration) {
            const oneClass = {
                name: child.name.escapedText,
                members: []
            };

            child.members.forEach(n => {
                if (n.name) {
                    const member = {
                        name: n.name.escapedText,
                        public: false,
                        private: false,
                        protected: false,
                        static: false,
                        modelProperty: [],
                        modelPropertyRaw: ''
                    };

                    (n.modifiers || []).forEach(modifier => {
                        switch (modifier.kind) {
                        case ts.SyntaxKind.PublicKeyword:
                            member.public = true;
                            break;
                        case ts.SyntaxKind.StaticKeyword:
                            member.static = true;
                            break;
                        case ts.SyntaxKind.PrivateKeyword:
                            member.private = true;
                            break;
                        case ts.SyntaxKind.ProtectedKeyword:
                            member.protected = true;
                            break;
                        case ts.SyntaxKind.Decorator:
                            if (((modifier.expression || {}).arguments || [])[0]) {
                                const argument = modifier.expression.arguments[0];
                                // TODO: processare le singole voci
                                (argument.properties || []).forEach(p => {
                                    member.modelProperty.push({
                                        name: src.substring(p.name.pos, p.name.end).trim().replace(/['"’]/g, ''),
                                        value: src.substring(p.initializer.pos, p.initializer.end).trim()
                                    });
                                });
                            } else {
                                member.modelPropertyRaw = src.substring(modifier.pos, modifier.end).trim();
                            }
                            break;
                        }
                    });
                    oneClass.members.push(member);
                }
            });

            classes.push(oneClass);
        }
    });

    return renderModelMarkdown(classes);
};
