import GenericClassFileParser, { TsClassMemberProperty } from './tsClass';
export default class lb4ModelParser extends GenericClassFileParser {
    renderPropertyMarkdown(property: TsClassMemberProperty): string[];
    renderMarkdown(): string[];
}
