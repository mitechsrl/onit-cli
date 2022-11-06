"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptMixinSelection = exports.mixinToArtifactFileName = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const inquirer_1 = __importDefault(require("inquirer"));
// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('@loopback/cli/lib/utils');
function toFileName(name) {
    return lodash_1.default.kebabCase(name).replace(/\-(\d+)$/g, '$1');
}
function mixinToArtifactFileName(mixinClass) {
    return toFileName(mixinClass.replace('Mixin', '')) + '.mixin';
}
exports.mixinToArtifactFileName = mixinToArtifactFileName;
/**
 * rompt the mixin selection checkboxes
 * @param {*} artifactInfo
 */
async function promptMixinSelection(localDir, artifactInfo) {
    // local mixins dir
    const mixinNames = [];
    // node_modules mixin dirs
    const checkPaths = [
        // this project
        {
            path: path_1.default.join(localDir, '../mixins/'),
            import: '../mixins/',
            appendName: ''
        },
        // onit-next as dependency
        {
            path: path_1.default.join(process.cwd(), './node_modules/@mitech/onit-next/src/mixins/'),
            import: '@mitech/onit-next/dist/mixins/',
            appendName: '(from @mitech/onit-next)'
        },
        // onit-next as dependency in npm workspaces
        {
            path: path_1.default.join(process.cwd(), '../onit-next/src/mixins/'),
            import: '@mitech/onit-next/dist/mixins/',
            appendName: '(from @mitech/onit-next)'
        }
    ];
    for (const p of checkPaths) {
        if (fs_1.default.existsSync(p.path)) {
            const mixins = await utils.getArtifactList(p.path, 'mixin', true);
            mixins.forEach(mixinName => {
                // do not add if already present
                if (mixinNames.find(m => m.name === mixinName))
                    return;
                mixinNames.push({
                    name: [mixinName, p.appendName].join(' '),
                    value: {
                        name: mixinName,
                        path: p.path,
                        import: p.import
                    }
                });
            });
        }
    }
    artifactInfo.mixins = [];
    if (mixinNames.length > 0) {
        artifactInfo.mixins = (await inquirer_1.default.prompt({
            type: 'checkbox',
            name: 'mixins',
            message: 'Select mixins',
            choices: mixinNames
        })).mixins.map((m) => {
            return { filename: m.import + mixinToArtifactFileName(m.name), mixinName: lodash_1.default.camelCase(m.name) };
        });
    }
}
exports.promptMixinSelection = promptMixinSelection;
//# sourceMappingURL=mixinUtils.js.map