import GenericClassFileParser, { TsClassMemberProperty } from './tsClass';
/**
 * Parse a loopback4 model class.
 * The processor is the same as the GenericClassFileParser but the render is slightly different due the
 * presence of property decorators which defines model properties. These decorators must be printed out aswell.
 */
export default class lb4ModelParser extends GenericClassFileParser {
    renderPropertyMarkdown(property: TsClassMemberProperty): string[];
    renderMarkdown(): string[];
}
