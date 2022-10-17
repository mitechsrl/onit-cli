const BelongsToRelationGenerator = require('@loopback/cli/generators/relation/belongs-to-relation.generator');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const ejs = require('ejs');

/**
 * Redefinition of BelongsToRelationGenerator for our internal needs
 */
class CustomBelongsToRelationGenerator extends BelongsToRelationGenerator {
    _initializeProperties (options) {
        // Our repos have a 'Base' class which is the one to be changed.
        // Temporary set the correct name
        super._initializeProperties(options);
        this.artifactInfo.originalSrcRepositoryClassName = this.artifactInfo.srcRepositoryClassName;
        this.artifactInfo.srcRepositoryClassName = 'Base';
    }

    /**
     * custom template path
     * @param {*} templateFile
     * @returns
     */
    templatePath (templateFile) {
        return path.join(__dirname, './templates/', templateFile);
    }

    /**
     * override the default copy template to add our custom render
     * @param {*} sourceFile
     * @param {*} dstFile
     * @param {*} data
     */
    copyTemplatedFiles (sourceFile, dstFile, data) {
        // render the model file and writer it out
        const template = readFileSync(sourceFile).toString();
        const rendered = ejs.render(template, data);
        writeFileSync(dstFile, rendered);
    }

    /**
     * Override generateRepositories to address our internal class name
     * @param {*} options
     */
    async generateRepositories (options) {
        await super.generateRepositories(options);
        this.artifactInfo.srcRepositoryClassName = this.artifactInfo.originalSrcRepositoryClassName;
    }
}
exports.CustomBelongsToRelationGenerator = CustomBelongsToRelationGenerator;
