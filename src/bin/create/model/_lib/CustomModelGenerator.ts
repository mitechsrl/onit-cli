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

import { readFileSync, writeFileSync, existsSync } from 'fs';
import _ from 'lodash';
import ejs from 'ejs';
import path from 'path';
import { GenericObject } from '../../../../types';
import { promptMixinSelection } from '../../_lib/mixinUtils';

// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('@loopback/cli/lib/utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ModelGenerator = require('@loopback/cli/generators/model/index');

/**
 * Subclass loopback-cli model generator and apply custom logic
 */
export class CustomModelGenerator extends ModelGenerator {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]){
        super(...args);
    }
    
    // override the default copy template since we are using a custom one.
    copyTemplatedFiles (_unused: unknown, filename:string, artifactInfo: GenericObject) {
        // render the model file and writer it out
        const template = readFileSync(path.join(__dirname, './templates/model.ts.ejs')).toString();
        const rendered = ejs.render(template, artifactInfo);
        writeFileSync(filename, rendered);
    }

    // overwrite the last methos to ask for mixins before effectively scaffolding
    async scaffold () {
        await this.promptMixinSelection();
        // magic stuff with names...
        if (!this.artifactInfo.name.toLowerCase().startsWith('onit')) {
            this.artifactInfo.name = 'Onit' + _.upperFirst(this.artifactInfo.name);
        }
        this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
        this.artifactInfo.className = _.upperFirst(_.camelCase(this.artifactInfo.className));
        this.artifactInfo.classNameCapitalModelName = _.snakeCase(this.artifactInfo.className).toUpperCase();

        // onit-next has different import path
        this.artifactInfo.importPath = '@mitech/onit-next/dist';
        if (existsSync(path.join(process.cwd(), './src/types/onitMixin.ts'))) {
            this.artifactInfo.importPath = '..';
        }

        // call the original scaffold
        await super.scaffold();

        // add the reference to index.ts file
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.className);
        await relationUtils.addExportController(
            this,
            path.resolve(this.artifactInfo.outDir, 'index.ts'),
            this.artifactInfo.className,
            kebabCaseFilename + '.model'
        );
    }

    // Prompt the mixin selection checkboxes
    async promptMixinSelection () {
        await promptMixinSelection(this.artifactInfo.modelDir, this.artifactInfo);
    }
}
