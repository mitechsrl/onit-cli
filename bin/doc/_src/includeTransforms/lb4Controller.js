/**
 * Process a repository TS file and produces a markdown document
 * This processor just use the generic class one
 */

const { GenericClassFileParser } = require('./genericClass');

class LB4ControllerParser extends GenericClassFileParser {
    /**
     * Add a custom piece of markdown after the title. THis mainly prints out the decorators.
     * @param {*} method
     * @returns
     */
    renderMethodMarkdownAfterTitle (method) {
        const result = [];

        if (method.decorators.length > 0) {
            result.push('#### Decorators');
            method.decorators.forEach(d => {
                result.push('**' + d.name + '**');
                const signature = d.name + '(' + d.params.join(', ') + ')';
                result.push('```json\n' + signature + '\n```\n');
            });
        }

        return result;
    }
}

// This file MUST export ProcessorClass since it is managed automatically by other scripts
module.exports.ProcessorClass = LB4ControllerParser;
