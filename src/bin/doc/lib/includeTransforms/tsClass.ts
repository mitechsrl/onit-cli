/**
 * Process a repository TS file and produces a markdown document
 */
import ts from 'typescript';
import yargs from 'yargs';
import { GenericObject } from '../../../../types';
import { escapeMarkdownChars } from '../escapeMarkdownChars';

export type TsClassCommon = {
    name: string,
    title?: string,
    chapter?: string,
    see?: string[],
    throws?: string[],
    deprecated?: string[],
    decorators: {
        name: string,
        params: string[],
    }[],
    comment: string[],
};

export type TsClassMemberCommon = {
    public: boolean,
    private: boolean,
    protected: boolean,
    static: boolean,
    async: boolean,
} & TsClassCommon;

export type TsClassMemberProperty ={
   
    type: string,
} & TsClassMemberCommon;

export type TsClassMemberMethod = {
    params: { name:string, type:string, comment:string }[],
    returnComment: string,
    returnType: string,
} & TsClassMemberCommon;

export type TsClass = {
    properties: TsClassMemberProperty[],
    methods: TsClassMemberMethod[],
    chapter: string,
} & TsClassCommon;
/**
 * Parse a generic typescript class
 */
export default class GenericClassFileParser {

    // internal cache
    classes: TsClass[] = [];

    /**
     * Convert a property object to markdown
     *
     * @param {*} property
     * @returns Array of markdown lines
     */
    renderPropertyMarkdown (property: TsClassMemberProperty ) {
        // do not output private methods
        if (property.private) return [];

        // Create the output
        const content = [];
        const titleBadges = [];
        if (property.private) titleBadges.push('<span class=\'badge badge-red\'><b>Private</b></span>');
        if (property.public) titleBadges.push('<span class=\'badge badge-green\'><b>Public</b></span>');
        if (property.protected) titleBadges.push('<span class=\'badge badge-yellow\'><b>Protected</b></span>');
        if (property.static) titleBadges.push('<span class=\'badge badge-gray\'><b>Static</b></span>');
        if (property.async) titleBadges.push('<span class=\'badge badge-gray\'><b>Async</b></span>');

        content.push(`#### ${escapeMarkdownChars(property.name)} <span class='member-type'>${escapeMarkdownChars(property.type)}</span> ${titleBadges.join(' ')}`);
        content.push(property.comment.join('\n'));

        return content;
    }

    /**
     * 
     * @param {*} method 
     * @returns 
     */
    renderMethodMarkdownAfterTitle(method: TsClassMemberMethod): string[]{
        return [];
    }

    /**
     * Convert a method object to markdown
     * @param {*} method
     * @returns Array of markdown lines
     */
    renderMethodMarkdown (method: TsClassMemberMethod) {
        // do not output private methods
        if (method.private) return [];

        // Create the output
        const content = [];

        const titleBadges = [];
        if (method.private) titleBadges.push('<span class=\'badge badge-red\'><b>Private</b></span>');
        if (method.public) titleBadges.push('<span class=\'badge badge-green\'><b>Public</b></span>');
        if (method.protected) titleBadges.push('<span class=\'badge badge-yellow\'><b>Protected</b></span>');
        if (method.static) titleBadges.push('<span class=\'badge badge-gray\'><b>Static</b></span>');
        if (method.async) titleBadges.push('<span class=\'badge badge-gray\'><b>Async</b></span>');

        content.push(`### ${method.name} ${titleBadges.join(' ')}`);

        // render method signature
        const signatureParams:string[] = [];
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
        const content: string[]= [];
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
    parse(src: string, filename:string, argv: yargs.ArgumentsCamelCase<unknown>){
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
    processModifiers<T extends TsClassMemberCommon>(obj: T, n:ts.Node){
        if (ts.canHaveModifiers(n)){
            ts.getModifiers(n)?.forEach(modifier => {
                switch (modifier.kind) {
                case ts.SyntaxKind.AsyncKeyword: obj.async = true; break;
                case ts.SyntaxKind.PublicKeyword: obj.public = true; break;
                case ts.SyntaxKind.PrivateKeyword: obj.private = true; break;
                case ts.SyntaxKind.ProtectedKeyword: obj.protected = true; break;
                case ts.SyntaxKind.StaticKeyword: obj.static = true; break;
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
    processDecorators<T extends TsClassCommon>(obj: T, src:string, n:ts.Node){
        if (ts.canHaveDecorators(n)){
            ts.getDecorators(n)?.forEach(decorator => {
                // @ts-expect-error expression does exist
                const expression = decorator.expression.expression;
                const name = expression.escapedText || src.substring(expression.pos, expression.end);
                // @ts-expect-error arguments does exists
                const params = decorator.expression.arguments.map(arg => {
                    return src.substring(arg.pos,arg.end);
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
    processMethodDeclaration (src:string, n: ts.Node): TsClassMemberMethod {
        let method: TsClassMemberMethod = {
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
            (comment.tags || []).forEach( (t:GenericObject) => {
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
    processProperty (src: string, n: ts.Node) {
        let property: TsClassMemberProperty = {
            // @ts-expect-error name does exist
            name: n.name.escapedText,
            // @ts-expect-error type does exist
            type: src.substring(n.type.pos, n.type.end).trim().replace(/['"’\r\n]/g, '').replace(/ +/g, ' '),
            comment: [],
            public: false,
            private: false,
            protected: false,
            static: false,
            async:false,
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
    processJSDoc<T extends TsClassCommon>(obj: T, src:string, n:ts.Node){
        // @ts-expect-error this property may exist
        (n.jsDoc || []).forEach((comment: ts.NodeObject)=> {
            if (comment.comment && comment.comment.trim()){
                obj.comment.push(comment.comment.trim());
            }
            (comment.tags || []).forEach((tag: GenericObject) => {
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
    extractInfo (src: string) {
        // parse the typescript file
        const node = ts.createSourceFile(
            'class.ts',
            src, // sourceText
            ts.ScriptTarget.ES2018
        );

        // process class declarations
        node.forEachChild(classChild => {
            if (classChild.kind === ts.SyntaxKind.ClassDeclaration) {
                let classDefinition: TsClass = {
                    properties:[],
                    methods: [],
                    // @ts-expect-error name does exist
                    name: classChild.name.escapedText,
                    decorators: [],
                    comment: [],
                    title:'',
                    chapter: ''
                };

                // process decorators if any
                classDefinition = this.processDecorators(classDefinition, src, classChild);

                // process jsdoc
                classDefinition = this.processJSDoc(classDefinition, src, classChild);
                // remove @src tags. We don0t want them to appear in the documentation text
                classDefinition.comment = classDefinition.comment.map(c => c.replace(/\[ *@src[^\]]+\]/gmi,'').trim());

                // process properties and method declarations
                // @ts-expect-error name does exist
                classChild.members.forEach((n: ts.Node) => {
                    // @ts-expect-error name does exist
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
