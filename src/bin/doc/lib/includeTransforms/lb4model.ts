
import GenericClassFileParser, { TsClassMemberProperty } from './tsClass';

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
        content.push('**Decorators**');
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
            /*if (classDefinition.methods.length) {
                content.push('## Methods');
                classDefinition.methods.forEach(p => content.push(...this.renderMethodMarkdown(p)));
            }*/
        });
        return content;
    }
    
}