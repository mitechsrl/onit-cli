const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const utils = require('@loopback/cli/lib/utils');
const inquirer = require('inquirer');

const toFileName = name => {
    return _.kebabCase(name).replace(/\-(\d+)$/g, '$1');
};

function mixinToArtifactFileName (mixinClass) {
    return toFileName(mixinClass.replace('Mixin', '')) + '.mixin';
};

module.exports.mixinToArtifactFileName = mixinToArtifactFileName;

/**
 * rompt the mixin selection checkboxes
 * @param {*} artifactInfo
 */
module.exports.promptMixinSelection = async function (localDir, artifactInfo) {
    // local mixins dir
    const mixinNames = [];

    // node_modules mixin dirs
    const checkPaths = [
        // this project
        {
            path: path.join(localDir, '../mixins/'),
            import: '../mixins/',
            appendName: ''
        },
        // onit-next as dependency
        {
            path: path.join(process.cwd(), './node_modules/@mitech/onit-next/src/mixins/'),
            import: '@mitech/onit-next/dist/mixins/',
            appendName: '(from @mitech/onit-next)'
        },
        // onit-next as dependency in npm workspaces
        {
            path: path.join(process.cwd(), '../onit-next/src/mixins/'),
            import: '@mitech/onit-next/dist/mixins/',
            appendName: '(from @mitech/onit-next)'
        }
    ];
    for (const p of checkPaths) {
        if (fs.existsSync(p.path)) {
            const mixins = await utils.getArtifactList(p.path, 'mixin', true);
            mixins.forEach(mixinName => {
                // do not add if already present
                if (mixinNames.find(m => m.name === mixinName)) return;

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
    };

    artifactInfo.mixins = [];
    if (mixinNames.length > 0) {
        artifactInfo.mixins = (await inquirer.prompt({
            type: 'checkbox',
            name: 'mixins',
            message: 'Select mixins',
            choices: mixinNames
        })).mixins.map(m => {
            return { filename: m.import + mixinToArtifactFileName(m.name), mixinName: _.camelCase(m.name) };
        });
    }
};
