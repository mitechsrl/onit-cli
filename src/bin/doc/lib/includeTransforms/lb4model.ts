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


import GenericClassFileParser, { TsClassMemberProperty } from './tsClass';

/**
 * Parse a loopback4 model class.
 * The processor is the same as the GenericClassFileParser but the render is slightly different due the 
 * presence of property decorators which defines model properties. These decorators must be printed out aswell.
 */
export default class lb4ModelParser extends GenericClassFileParser{

    renderPropertyMarkdown(property: TsClassMemberProperty): string[] {
        const content: string[] = [];
        const titleBadges: string[] = [];

        /*const memberProp = function (name: string) {
            const prop = member.modelProperty.find(p => p.name === name);
            member.modelProperty = member.modelProperty.filter(p => p.name !== name);
            return prop;
        };

        const type = memberProp('type');
        if (type) titleBadges.push(`<span class='member-type'>${escapeMarkdownChars(type.value.replace(/['"’]/g, ''))}</span>`);

        const id = memberProp('id');
        if (id && id.value.indexOf('true') >= 0) {
            titleBadges.push('<span class=\'badge badge-green\'><b>ID</b></span>');
        }

        const required = memberProp('required');
        if (required && required.value.indexOf('true') >= 0) {
            titleBadges.push('<span class=\'badge badge-yellow\'><b>Required</b></span>');
        }
*/
        if (property.private) titleBadges.push('<span class=\'badge badge-red\'><b>Private</b></span>');
        if (property.public) titleBadges.push('<span class=\'badge badge-green\'><b>Public</b></span>');
        if (property.protected) titleBadges.push('<span class=\'badge badge-yellow\'><b>Protected</b></span>');
        if (property.static) titleBadges.push('<span class=\'badge badge-gray\'><b>Static</b></span>');

        content.push(`##### ${property.name} ${titleBadges.join(' ')}`);
        content.push('```ts\n' + property.decorators.map(d => d.name+'('+d.params.join(',')+')').join('\n') + '\n```\n\n');

        /*const description = memberProp('description');
        if (description) {
            content.push(description.value + '\n');
        }

        member.modelProperty.forEach(p => {
            content.push(`${escapeMarkdownChars(p.name)}: ${escapeMarkdownChars(p.value)}`);
        });

        if (member.modelPropertyRaw) {
            content.push('```ts\n' + member.modelPropertyRaw + '\n```\n\n');
        }
        */

        return content;
    }
    
    renderMarkdown(): string[] {
        const content: string[]= [];
        this.classes.forEach(classDefinition => {
            content.push('## '+classDefinition.name);
            if (classDefinition.properties.length) {
                content.push('### Model properties and relations');
                classDefinition.properties.forEach(p => content.push(...this.renderPropertyMarkdown(p)));
            }
            if (classDefinition.methods.length) {
                content.push('## Methods');
                classDefinition.methods.forEach(p => content.push(...this.renderMethodMarkdown(p)));
            }
        });
        return content;
    }
    
}