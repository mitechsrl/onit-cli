/**
 * Process a repository TS file and produces a markdown document
 */
const ts = require('typescript');
const { escapeMarkdownChars } = require('../lib/escapeMarkdownChars');

/**
 * Parse a generic typescript class
 */
class GenericClassFileParser {

    // internal cache
    classes = [];

    /**
     * Convert a property object to markdown
     *
     * @param {*} property
     * @returns Array of markdown lines
     */
    renderPropertyMarkdown (property) {
        // do not output private methods
        if (property.private) return [];

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

        return content;
    }

    /**
     * 
     * @param {*} method 
     * @returns 
     */
    renderMethodMarkdownAfterTitle(method){
        return []
    }

    /**
     * Convert a method object to markdown
     * @param {*} method
     * @returns Array of markdown lines
     */
    renderMethodMarkdown (method) {
        // do not output private methods
        if (method.private) return [];

        // Create the output
        const content = [];

        const titleBadges = [];
        if (method.private) titleBadges.push("<span class='badge badge-red'><b>Private</b></span>");
        if (method.public) titleBadges.push("<span class='badge badge-green'><b>Public</b></span>");
        if (method.protected) titleBadges.push("<span class='badge badge-yellow'><b>Protected</b></span>");
        if (method.static) titleBadges.push("<span class='badge badge-gray'><b>Static</b></span>");
        if (method.async) titleBadges.push("<span class='badge badge-gray'><b>Async</b></span>");

        content.push(`### ${method.name} ${titleBadges.join(' ')}`);

        this.render
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

        // entry point to let subclasses to customize stuff after title
        content.push(...this.renderMethodMarkdownAfterTitle(method));

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

        return content;
    }
        
    /**
     * Render repository markdown
     *
     * @returns Array of markdown lines
     */
    renderMarkdown () {
        const content = [];
        this.classes.forEach(classDefinition => {
            content.push('## '+classDefinition.name +' class');
            if (classDefinition.properties.length) {
                content.push('## Properties');
                classDefinition.properties.forEach(p => content.push(...this.renderPropertyMarkdown(p)));
            }
            if (classDefinition.methods.length) {
                content.push('## Methods');
                classDefinition.methods.forEach(p => content.push(...this.renderMethodMarkdown(p)));
            }
        })
        return content;
    }

 
    /**
     * Process thepassed-in src file andproduces a markdown output
     *
     * @param {*} src The source file content
     * @param {*} filename The source filename
     * @param {*} params 
     * @returns the built markdown string
     */
    parse(src, filename, params){
        // extract file info in internal cache
        this.extractInfo(src);

        // render the final repo markdown
        return this.renderMarkdown().join('\n');
    }

    /**
     * Process the current AST node and extract modifiers
     * @param {*} obj descriptor object
     * @param {*} n current AST node 
     * @return the populated descripor object
     */
    processModifiers(obj, n){
        (n.modifiers || []).forEach(modifier => {
            switch (modifier.kind) {
            case ts.SyntaxKind.AsyncKeyword: obj.async = true; break;
            case ts.SyntaxKind.PublicKeyword: obj.public = true; break;
            case ts.SyntaxKind.PrivateKeyword: obj.private = true; break;
            case ts.SyntaxKind.ProtectedKeyword: obj.protected = true; break;
            case ts.SyntaxKind.StaticKeyword: obj.static = true; break;
            }
        });

        return obj;
    }

    /**
     * Process the current AST node and extract decorators
     * @param {*} obj  descriptor object
     * @param {*} n  current AST node 
     * @return the populated descripor object
     */
    processDecorators(obj, src, n){
        (n.decorators || []).forEach(decorator => {
            const expression = decorator.expression.expression;
            const name = expression.escapedText || src.substring(expression.pos, expression.end);
            const params = decorator.expression.arguments.map(arg => {
                return src.substring(arg.pos,arg.end)
            })
            obj.decorators.push({
                name: name,
                params: params,
            })
        });

        return obj;
    }
    /**
     * Process a method declaration node
     * 
     * @param {*} src the source file content
     * @param {*} n Current ast node
     * @returns A object describing this property
     */
    processMethodDeclaration (src, n) {
        let method = {
            public: false,
            private: false,
            protected: false,
            static: false,
            async: false,
            name: n.name.escapedText,
            params: [],
            comment: [],
            returnComment: '',
            returnType: '',
            decorators: []
        };

        method = this.processDecorators(method, src, n);
        method = this.processModifiers(method, n);

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

        // call the basic jsdoc parser for generic info
        method = this.processJSDoc(method, src, n);
        // add custom parsing for method-specific data
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


    /**
     * Process a property declaration node 
     * 
     * @param {*} src the source file content
     * @param {*} n Current property AST node
     * @returns 
     */
    processProperty (src, n) {
        let property = {
            name: n.name.escapedText,
            type: src.substring(n.type.pos, n.type.end).trim().replace(/['"’\r\n]/g, '').replace(/ +/g, ' '),
            comment: [],
            public: false,
            private: false,
            protected: false,
            static: false,
            decorators:[]
        };

        property = this.processDecorators(property, src, n);
        property = this.processModifiers(property, n);
        property = this.processJSDoc(property, src, n);

        return property;
    }

    /**
     * Process some basic jsdoc properties
     * 
     * @param {*} obj descriptor object
     * @param {*} src the source file content
     * @param {*} n Current property AST node
     * @return the populated descripor object 
     */
    processJSDoc(obj, src, n){

        (n.jsDoc || []).forEach(comment => {
            if (comment.comment){
                obj.comment.push(comment.comment);
            }
            (comment.tags || []).forEach(tag => {
                if (tag.comment){
                    switch(tag.tagName.escapedText){
                        case 'summary': 
                            obj.comment.push(tag.comment);
                            break;
                        case 'title': 
                            obj.title = tag.comment;
                            break;
                        case 'chapter': 
                            obj.chapter = tag.comment;
                            break;
                    }
                }
            })
        });

        return obj;
    }
    /**
     * Parse the passed-in src to extract the file info
     * 
     * @param {*} src 
     */
    extractInfo (src) {
        // parse the typescript file
        const node = ts.createSourceFile(
            'class.ts',
            src, // sourceText
            ts.ScriptTarget.ES2018
        );

        // process class declarations
        node.forEachChild(child => {
            if (child.kind === ts.SyntaxKind.ClassDeclaration) {
                let classDefinition = {
                    properties:[],
                    methods: [],
                    name: child.name.escapedText,
                    decorators: [],
                    comment: [],
                    title:'',
                    chapter: ''
                }

                // process decorators if any
                classDefinition = this.processDecorators(classDefinition, src, child);

                // process jsdoc
                classDefinition = this.processJSDoc(classDefinition, src, child);

                // process properties and method declarations
                child.members.forEach(n => {
                    if (n.name) {
                        if (n.kind === ts.SyntaxKind.PropertyDeclaration) {
                            classDefinition.properties.push(this.processProperty(src,n));
                        }
                        if (n.kind === ts.SyntaxKind.MethodDeclaration) {
                            classDefinition.methods.push(this.processMethodDeclaration(src,n));
                        }
                    }
                });

                this.classes.push(classDefinition);
            }
        });
    }
}

// This file MUST export ProcessorClass since it is managed automatically by other scripts
module.exports.ProcessorClass = GenericClassFileParser
module.exports.GenericClassFileParser = GenericClassFileParser