/**
 * Process a repository TS file and produces a markdown document
 */
const ts = require('typescript');
const { escapeMarkdownChars } = require('../lib/escapeMarkdownChars');


class Lb4RepositoryParser {

    // internal cache
    properties = [];
    methods = [];

    /**
     * Convert a property object to markdown
     *
     * @param {*} property
     * @returns
     */
    renderPropertyMarkdown (property) {
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

        content.push(`#### ${escapeMarkdownChars(property.name)} <span class='member-type'>${escapeMarkdownChars(property.type)}</span> ${titleBadges.join(' ')}`);
        content.push(property.comment.join('\n'));

        return content.join('\n');
    }

    /**
     * Convert a method object to markdown
     * @param {*} method
     * @returns
     */
    renderMethodMarkdown (method) {
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

        // render method signature
        const signatureParams = [];
        method.params.forEach(param => {
            signatureParams.push(`${param.name}: ${param.type}`);
        });
        const returnType = method.returnType ? (': ' + method.returnType) : '';
        const signature = '```ts\n' + method.name + '(' + signatureParams.join(', ') + ')' + returnType + '\n```';
        content.push(signature);

        // add jsdoc comment
        if (method.comment.length) {
            content.push(method.comment.join('\n'));
        }

        // render parameters
        if (method.params.length > 0) {
            content.push('#### Params');
            method.params.forEach(param => {
                content.push(`**${escapeMarkdownChars(param.name)}** _${escapeMarkdownChars(param.type)}_\n{: .mb-0 }`);
                if (param.comment) {
                    content.push(`${param.comment.trim()}\n{: .mx-3 .my-0 }`);
                }
            });
        }

        // render return type
        if (method.returnType || method.returnComment) {
            content.push('#### Returns');
            content.push([
                method.returnType ? `_${escapeMarkdownChars(method.returnType)}_` : '',
                method.returnComment || ''
            ].filter(p => !!p).join(' '));
        }

        return content.join('\n');
    }
        
    /**
     * Render repository markdown
     *
     * @returns
     */
    renderMarkdown () {
        const _final = [];
        if (this.properties.length) {
            _final.push('## Properties');
            this.properties.forEach(p => _final.push(this.renderPropertyMarkdown(p)));
        }
        if (this.methods.length) {
            _final.push('## Methods');
            this.methods.forEach(p => _final.push(this.renderMethodMarkdown(p)));
        }
        return _final.join('\n');
    }

    /**
     * Process thepassed-in src file andproduces a markdown output
     * @param {*} src 
     * @returns 
     */
    parse(src ,  filename, params){
        // extract file infoin internal cache
        this.extractInfo(src);

        // render the final repo markdown
        return this.renderMarkdown(this.properties, this.methods);
    }

    /**
     * Parse the passed-in src to extract the file info
     * @param {*} src 
     */
    extractInfo (src) {
        // parse the typescript file
        const node = ts.createSourceFile(
            'repository.ts',
            src, // sourceText
            ts.ScriptTarget.ES2018
        );

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
                property.comment.push((comment.comment || '').trim());
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
                returnComment: '',
                returnType: ''
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

            if (n.type) {
                method.returnType = src.substring(n.type.pos, n.type.end).trim();
            }

            (n.jsDoc || []).forEach(comment => {
                method.comment.push(comment.comment);

                (comment.tags || []).forEach(t => {
                    const tagName = src.substring(t.tagName.pos, t.tagName.end).trim();
                    switch (tagName) {
                    case 'param': {
                        const paramName = src.substring(t.name.pos, t.name.end).trim();
                        if (t.comment) {
                            const _p = method.params.find(p => p.name === paramName);
                            if (_p) {
                                _p.comment = t.comment.trim();
                            }
                        }
                        break;
                    }
                    case 'returns': method.returnComment = (t.comment || '').trim();
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
                            this.properties.push(processProperty(n));
                        }
                        if (n.kind === ts.SyntaxKind.MethodDeclaration) {
                            this.methods.push(processMethodDeclaration(n));
                        }
                    }
                });
            }
        });
    }
}

// This file MUST export ProcessorClass since it is managed automatically by other scripts
module.exports.ProcessorClass = Lb4RepositoryParser