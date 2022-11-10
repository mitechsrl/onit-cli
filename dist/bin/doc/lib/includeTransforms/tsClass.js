"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Process a repository TS file and produces a markdown document
 */
const typescript_1 = __importDefault(require("typescript"));
const escapeMarkdownChars_1 = require("../escapeMarkdownChars");
/**
 * Parse a generic typescript class
 */
class GenericClassFileParser {
    constructor() {
        // internal cache
        this.classes = [];
    }
    /**
     * Convert a property object to markdown
     *
     * @param {*} property
     * @returns Array of markdown lines
     */
    renderPropertyMarkdown(property) {
        // do not output private methods
        if (property.private)
            return [];
        // Create the output
        const content = [];
        const titleBadges = [];
        if (property.private)
            titleBadges.push('<span class=\'badge badge-red\'><b>Private</b></span>');
        if (property.public)
            titleBadges.push('<span class=\'badge badge-green\'><b>Public</b></span>');
        if (property.protected)
            titleBadges.push('<span class=\'badge badge-yellow\'><b>Protected</b></span>');
        if (property.static)
            titleBadges.push('<span class=\'badge badge-gray\'><b>Static</b></span>');
        if (property.async)
            titleBadges.push('<span class=\'badge badge-gray\'><b>Async</b></span>');
        content.push(`#### ${(0, escapeMarkdownChars_1.escapeMarkdownChars)(property.name)} <span class='member-type'>${(0, escapeMarkdownChars_1.escapeMarkdownChars)(property.type)}</span> ${titleBadges.join(' ')}`);
        content.push(property.comment.join('\n'));
        return content;
    }
    /**
     *
     * @param {*} method
     * @returns
     */
    renderMethodMarkdownAfterTitle(method) {
        return [];
    }
    /**
     * Convert a method object to markdown
     * @param {*} method
     * @returns Array of markdown lines
     */
    renderMethodMarkdown(method) {
        // do not output private methods
        if (method.private)
            return [];
        // Create the output
        const content = [];
        const titleBadges = [];
        if (method.private)
            titleBadges.push('<span class=\'badge badge-red\'><b>Private</b></span>');
        if (method.public)
            titleBadges.push('<span class=\'badge badge-green\'><b>Public</b></span>');
        if (method.protected)
            titleBadges.push('<span class=\'badge badge-yellow\'><b>Protected</b></span>');
        if (method.static)
            titleBadges.push('<span class=\'badge badge-gray\'><b>Static</b></span>');
        if (method.async)
            titleBadges.push('<span class=\'badge badge-gray\'><b>Async</b></span>');
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
        // entry point to let subclasses to customize stuff after title
        content.push(...this.renderMethodMarkdownAfterTitle(method));
        // render parameters
        if (method.params.length > 0) {
            content.push('#### Params');
            method.params.forEach(param => {
                content.push(`**${(0, escapeMarkdownChars_1.escapeMarkdownChars)(param.name)}** _${(0, escapeMarkdownChars_1.escapeMarkdownChars)(param.type)}_\n{: .mb-0 }`);
                if (param.comment) {
                    content.push(`${param.comment.trim()}\n{: .mx-3 .my-0 }`);
                }
            });
        }
        // render return type
        if (method.returnType || method.returnComment) {
            content.push('#### Returns');
            content.push([
                method.returnType ? `_${(0, escapeMarkdownChars_1.escapeMarkdownChars)(method.returnType)}_` : '',
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
    renderMarkdown() {
        const content = [];
        this.classes.forEach(classDefinition => {
            content.push('## ' + classDefinition.name + ' class');
            if (classDefinition.properties.length) {
                content.push('## Properties');
                classDefinition.properties.forEach(p => content.push(...this.renderPropertyMarkdown(p)));
            }
            if (classDefinition.methods.length) {
                content.push('## Methods');
                classDefinition.methods.forEach(p => content.push(...this.renderMethodMarkdown(p)));
            }
        });
        return content;
    }
    /**
     * Process the passed-in src file andproduces a markdown output
     *
     * @param {*} src The source file content
     * @param {*} filename The source filename
     * @param {*} params
     * @returns the built markdown string
     */
    parse(src, filename, argv) {
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
    processModifiers(obj, n) {
        var _a;
        if (typescript_1.default.canHaveModifiers(n)) {
            (_a = typescript_1.default.getModifiers(n)) === null || _a === void 0 ? void 0 : _a.forEach(modifier => {
                switch (modifier.kind) {
                    case typescript_1.default.SyntaxKind.AsyncKeyword:
                        obj.async = true;
                        break;
                    case typescript_1.default.SyntaxKind.PublicKeyword:
                        obj.public = true;
                        break;
                    case typescript_1.default.SyntaxKind.PrivateKeyword:
                        obj.private = true;
                        break;
                    case typescript_1.default.SyntaxKind.ProtectedKeyword:
                        obj.protected = true;
                        break;
                    case typescript_1.default.SyntaxKind.StaticKeyword:
                        obj.static = true;
                        break;
                }
            });
        }
        return obj;
    }
    /**
     * Process the current AST node and extract decorators
     * @param {*} obj  descriptor object
     * @param {*} n  current AST node
     * @return the populated descripor object
     */
    processDecorators(obj, src, n) {
        var _a;
        if (typescript_1.default.canHaveDecorators(n)) {
            (_a = typescript_1.default.getDecorators(n)) === null || _a === void 0 ? void 0 : _a.forEach(decorator => {
                // @ts-expect-error expression does exist
                const expression = decorator.expression.expression;
                const name = expression.escapedText || src.substring(expression.pos, expression.end);
                // @ts-expect-error arguments does exists
                const params = decorator.expression.arguments.map(arg => {
                    return src.substring(arg.pos, arg.end);
                });
                obj.decorators.push({
                    name: name,
                    params: params,
                });
            });
        }
        return obj;
    }
    /**
     * Process a method declaration node
     *
     * @param {*} src the source file content
     * @param {*} n Current ast node
     * @returns A object describing this property
     */
    processMethodDeclaration(src, n) {
        let method = {
            public: false,
            private: false,
            protected: false,
            static: false,
            async: false,
            // @ts-expect-error name does exist
            name: n.name.escapedText,
            params: [],
            comment: [],
            returnComment: '',
            returnType: '',
            decorators: []
        };
        method = this.processDecorators(method, src, n);
        method = this.processModifiers(method, n);
        // @ts-expect-error this may exist
        (n.parameters || []).forEach(p => {
            const params = {
                name: src.substring(p.name.pos, p.name.end).trim(),
                type: src.substring(p.type.pos, p.type.end).trim().replace(/['"’\r\n]/g, '').replace(/ +/g, ' '),
                comment: ''
            };
            method.params.push(params);
        });
        // @ts-expect-error n.type may exist
        if (n.type) {
            // @ts-expect-error n.type may exist
            method.returnType = src.substring(n.type.pos, n.type.end).trim();
        }
        // call the basic jsdoc parser for generic info
        method = this.processJSDoc(method, src, n);
        // add custom parsing for method-specific data
        // @ts-expect-error jsDoc may exist
        (n.jsDoc || []).forEach(comment => {
            (comment.tags || []).forEach((t) => {
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
                    case 'returns':
                        method.returnComment = (t.comment || '').trim();
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
    processProperty(src, n) {
        let property = {
            // @ts-expect-error name does exist
            name: n.name.escapedText,
            // @ts-expect-error type does exist
            type: src.substring(n.type.pos, n.type.end).trim().replace(/['"’\r\n]/g, '').replace(/ +/g, ' '),
            comment: [],
            public: false,
            private: false,
            protected: false,
            static: false,
            async: false,
            decorators: []
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
    processJSDoc(obj, src, n) {
        // @ts-expect-error this property may exist
        (n.jsDoc || []).forEach((comment) => {
            if (comment.comment && comment.comment.trim()) {
                obj.comment.push(comment.comment.trim());
            }
            (comment.tags || []).forEach((tag) => {
                if (tag.comment) {
                    switch (tag.tagName.escapedText) {
                        case 'summary':
                            obj.comment.push(tag.comment);
                            break;
                        case 'title':
                            obj.title = tag.comment;
                            break;
                        case 'chapter':
                            obj.chapter = tag.comment;
                            break;
                        case 'see':
                            obj.see = obj.see || [];
                            obj.see.push(tag.comment);
                            break;
                        case 'throws':
                            obj.throws = obj.throws || [];
                            obj.throws.push(tag.comment);
                            break;
                        case 'deprecated':
                            obj.deprecated = obj.deprecated || [];
                            obj.deprecated.push(tag.comment);
                            break;
                    }
                }
            });
        });
        return obj;
    }
    /**
     * Parse the passed-in src to extract the file info
     *
     * @param {*} src
     */
    extractInfo(src) {
        // parse the typescript file
        const node = typescript_1.default.createSourceFile('class.ts', src, // sourceText
        typescript_1.default.ScriptTarget.ES2018);
        // process class declarations
        node.forEachChild(classChild => {
            if (classChild.kind === typescript_1.default.SyntaxKind.ClassDeclaration) {
                let classDefinition = {
                    properties: [],
                    methods: [],
                    // @ts-expect-error name does exist
                    name: classChild.name.escapedText,
                    decorators: [],
                    comment: [],
                    title: '',
                    chapter: ''
                };
                // process decorators if any
                classDefinition = this.processDecorators(classDefinition, src, classChild);
                // process jsdoc
                classDefinition = this.processJSDoc(classDefinition, src, classChild);
                // remove @src tags. We don0t want them to appear in the documentation text
                classDefinition.comment = classDefinition.comment.map(c => c.replace(/\[ *@src[^\]]+\]/gmi, '').trim());
                // process properties and method declarations
                // @ts-expect-error name does exist
                classChild.members.forEach((n) => {
                    // @ts-expect-error name does exist
                    if (n.name) {
                        if (n.kind === typescript_1.default.SyntaxKind.PropertyDeclaration) {
                            classDefinition.properties.push(this.processProperty(src, n));
                        }
                        if (n.kind === typescript_1.default.SyntaxKind.MethodDeclaration) {
                            classDefinition.methods.push(this.processMethodDeclaration(src, n));
                        }
                    }
                });
                this.classes.push(classDefinition);
            }
        });
    }
}
exports.default = GenericClassFileParser;
//# sourceMappingURL=tsClass.js.map