/**
 * Process a repository TS file and produces a markdown document
 * This processor just use the generic class one
 */
import GenericClassFileParser, { TsClassMemberMethod } from './tsClass';
export default class LB4ControllerParser extends GenericClassFileParser {
    /**
     * Add a custom piece of markdown after the title. THis mainly prints out the decorators.
     * @param {*} method
     * @returns
     */
    renderMethodMarkdownAfterTitle(method: TsClassMemberMethod): string[];
}
