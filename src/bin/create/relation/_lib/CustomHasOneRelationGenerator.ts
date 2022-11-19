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

import { readFileSync, writeFileSync } from 'fs';
import ejs from 'ejs';
import { join } from 'path';
import { GenericObject } from '../../../../types';

// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const HasOneRelationGenerator = require('@loopback/cli/generators/relation/has-one-relation.generator');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');

export class CustomHasOneRelationGenerator extends HasOneRelationGenerator {
    /**
     * Our repos have a 'Base' class which is the one to be changed.
     * Temporary set the correct name
     * @param {*} options
     */
    _initializeProperties (options:GenericObject) {
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
    templatePath (templateFile:string) {
        return join(__dirname, './templates/', templateFile);
    }

    /**
     * override the default copy template to add our custom render
     * @param {*} sourceFile
     * @param {*} dstFile
     * @param {*} data
     */
    copyTemplatedFiles (sourceFile:string, dstFile:string, data:GenericObject) {
        // render the model file and writer it out
        const template = readFileSync(sourceFile).toString();
        const rendered = ejs.render(template, data);
        writeFileSync(dstFile, rendered);
    }

    /**
     * Override generateRepositories to address our internal class name
     * @param {*} options
     */
    async generateRepositories (options:GenericObject) {
        await super.generateRepositories(options);
        this.artifactInfo.srcRepositoryClassName = this.artifactInfo.originalSrcRepositoryClassName;
    }
}
