/**
 * Process a repository TS file and produces a markdown document
 * This processor just use the generic class one
 */

const { GenericClassFileParser } = require('./genericClass');

// This file MUST export ProcessorClass since it is managed automatically by other scripts
module.exports.ProcessorClass = GenericClassFileParser;
