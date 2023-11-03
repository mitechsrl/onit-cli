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
import _ from 'lodash';
import ejs from 'ejs';
import { join, resolve } from 'path';
import { GenericObject } from '../../../../types';
import yeoman from 'yeoman-environment';
import fs from 'fs';

// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ServiceGenerator = require('@loopback/cli/generators/service/index');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('@loopback/cli/lib/utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');

/**
 * Subclass loopback-cli model generator and apply custom logic
 */
export class CustomServiceGenerator extends ServiceGenerator {
    constructor(){
        super({ env: yeoman.createEnv() });
    }
    
    // override the default copy template since we are using a custom one.
    copyTemplatedFiles (_unused:unknown, filename:string, data: GenericObject) {
        // render the model file and writer it out
        const template = readFileSync(this.artifactInfo.defaultTemplate).toString();
        const rendered = ejs.render(template, data);
        writeFileSync(filename, rendered);
    }

    // overwrite the last methos to ask for mixins before effectively scaffolding
    async scaffold () {
        // change directory polinters
        const REMOTE_SERVICE_TEMPLATE = join(__dirname, './templates/remote-service-proxy-template.ts.ejs');
        const LOCAL_CLASS_TEMPLATE = join(__dirname, './templates/local-service-class-template.ts.ejs');
        const LOCAL_PROVIDER_TEMPLATE = join(__dirname, '../templates/local-service-provider-template.ts.ejs');
        const TEMPLATES: GenericObject = {
            proxy: REMOTE_SERVICE_TEMPLATE,
            class: LOCAL_CLASS_TEMPLATE,
            provider: LOCAL_PROVIDER_TEMPLATE
        };

        this.artifactInfo.defaultTemplate = TEMPLATES[this.artifactInfo.serviceType];

        // magic stuff with names...
        if (!this.artifactInfo.name.toLowerCase().startsWith('onit')) {
            this.artifactInfo.name = 'Onit' + _.upperFirst(this.artifactInfo.name);
        }
        // Remove final service if any...will be set automatically
        if (this.artifactInfo.name.toLowerCase().endsWith('service')) {
            this.artifactInfo.name = this.artifactInfo.name.substring(0, this.artifactInfo.name.length-7);
        }

        this.artifactInfo.className = utils.toClassName(this.artifactInfo.name);
        this.artifactInfo.className = _.upperFirst(_.camelCase(this.artifactInfo.className));
        
        this.artifactInfo.classNameCapitalServiceName = _.snakeCase(this.artifactInfo.className).toUpperCase();

        fs.mkdirSync(this.artifactInfo.outDir, { recursive:true });
        
        await super.scaffold();
        
        // add the reference to index.ts file
        const kebabCaseFilename = utils.toFileName(this.artifactInfo.className);
        
        await relationUtils.addExportController(
            this,
            resolve(this.artifactInfo.outDir, 'index.ts'),
            this.artifactInfo.className,
            kebabCaseFilename + '.service'
        );
    }
}

