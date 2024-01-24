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

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import ejs from 'ejs';
import { join, resolve } from 'path';
import { GenericObject } from '../../../../types';
import yeoman from 'yeoman-environment';

// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ControllerGenerator = require('@loopback/cli/generators/controller/index');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('@loopback/cli/lib/utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');

/**
 * Subclass loopback-cli generator and apply custom logic
 */
export class CustomControllerGenerator extends ControllerGenerator {
    constructor(){
        super({ env: yeoman.createEnv() });
    }
    
    /**
     * override the default copy template since we are using a custom one.
     * @param {*} _source the template file path. unused here, will be recalculated
     * @param {*} _dest The original destination file path. Unused here, will be recalculated.
     * @param {*} artifactInfo Source data object for current artifact
     */
    copyTemplatedFiles (_source:unknown, _dest: string, artifactInfo: GenericObject) {
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.name);
        const destpath = join(this.artifactInfo.outDir, kebabCaseFilename);
        if (!existsSync(destpath)) {
            mkdirSync(destpath, { recursive: true });
        }
        const dest = join(destpath, this.artifactInfo.outFile);

        // recalculate the template files
        let controllerTemplate = 'controller-template.ts.ejs';
        let specsTemplate = 'specs-template.ts.ejs';
        switch (this.artifactInfo.controllerType) {
        case ControllerGenerator.REST:
            controllerTemplate = 'controller-rest-template.ts.ejs';
            specsTemplate = 'specs-rest-template.ts.ejs';
            break;
        default:
            break;
        }
        controllerTemplate = join(__dirname, './templates/' + controllerTemplate);
        specsTemplate = join(__dirname, './templates/' + specsTemplate);

        // onit-next has different import path
        artifactInfo.importPath = '@mitech/onit-next/dist';
        if (existsSync(join(process.cwd(), './src/types/onitMixin.ts'))) {
            artifactInfo.importPath = '..';
        }

        // render the files and write them out
        const controllerTemplateContent = readFileSync(controllerTemplate).toString();
        const specsTemplateContent = readFileSync(specsTemplate).toString();
        const renderedController = ejs.render(controllerTemplateContent, artifactInfo);
        const renderedSpecs = ejs.render(specsTemplateContent, artifactInfo);
        writeFileSync(dest, renderedController);
        writeFileSync(join(dest, '../specs.ts'), renderedSpecs);

        // add the reference to index.ts file
        relationUtils.addExportController(this,
            resolve(this.artifactInfo.outDir, 'index.ts'),
            this.artifactInfo.controllerClassName,
            kebabCaseFilename + '/' + kebabCaseFilename + '.controller'
        );
    }
}
