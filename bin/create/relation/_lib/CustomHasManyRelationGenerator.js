const HasManyRelationGenerator = require('@loopback/cli/generators/relation/has-many-relation.generator');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const ejs = require('ejs');
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');

class CustomHasManyRelationGenerator extends HasManyRelationGenerator {
    /**
     * Our repos have a 'Base' class which is the one to be changed.
     * Temporary set the correct name
     * @param {*} options
     */
    _initializeProperties (options) {
        // Our repos have a 'Base' class which is the one to be changed. Temporary set the correct name.
        super._initializeProperties(options);

        // check if we have the Base class. If so, use that class instead of the original srcRepositoryClassName
        // still keep the previous value for future uses
        this.artifactInfo.originalSrcRepositoryClassName = this.artifactInfo.srcRepositoryClassName;
        try {
            relationUtils.getClassObj(this.artifactInfo.srcRepositoryFileObj, 'Base');
            this.artifactInfo.srcRepositoryClassName = 'Base';
        } catch (e) { /* getting here meas Baseis not available */ }
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

exports.CustomHasManyRelationGenerator = CustomHasManyRelationGenerator;
