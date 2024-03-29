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

import { GenericObject } from '../../../../types';
import { CustomBelongsToRelationGenerator } from './CustomBelongsToRelationGenerator';
import { CustomHasManyRelationGenerator } from './CustomHasManyRelationGenerator';
import { CustomHasManyThroughRelationGenerator } from './CustomHasManyThroughRelationGenerator';
import { CustomHasOneRelationGenerator } from './CustomHasOneRelationGenerator';
import yeoman from 'yeoman-environment';

// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RelationGenerator = require('@loopback/cli/generators/relation/index');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const relationUtils = require('@loopback/cli/generators/relation/utils.generator');

export class CustomRelationGenerator extends RelationGenerator {
    constructor(){
        super({ env: yeoman.createEnv() });
    }
    
    async scaffold () {
        if (this.shouldExit()) return false;

        let relationGenerator: GenericObject|null = null;

        this.artifactInfo.name = this.artifactInfo.relationType;

        switch (this.artifactInfo.relationType) {
        case relationUtils.relationType.belongsTo:
            // @ts-expect-error no typings for this class. Ignore error.
            relationGenerator = new CustomBelongsToRelationGenerator(this.args, this.opts);
            break;
        case relationUtils.relationType.hasMany:
            // @ts-expect-error no typings for this class. Ignore error.
            relationGenerator = new CustomHasManyRelationGenerator(this.args, this.opts);
            break;
        case relationUtils.relationType.hasManyThrough:
            // @ts-expect-error no typings for this class. Ignore error.
            relationGenerator = new CustomHasManyThroughRelationGenerator(this.args, this.opts);
            break;
        case relationUtils.relationType.hasOne:
            // @ts-expect-error no typings for this class. Ignore error.
            relationGenerator = new CustomHasOneRelationGenerator(this.args, this.opts);
            break;
        }

        try {
            await relationGenerator!.generateAll(this.artifactInfo);
        } catch (error) {
            /* istanbul ignore next */
            this.exit(error);
        }
    }
}