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

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const onitFileLoader = require('../onitFileLoader');
const find = require('find');

/**
 * Create teh webpack exports config by merging all the exports from our node_modules dependencies
 *
 * @param {*} context
 * @param {*} onitConfigFile
 * @returns
 */
const buildWebpackConfig = async (context, onitConfigFile) => {
    const moduleName = path.basename(context);

    // get this module webpack config
    let config = _.get(onitConfigFile, 'json.export.webpack', {});

    const scope = '@mitech';

    // merge it with all the configs from node modules paths
    const nodeModulesPath = path.resolve(context, './node_modules/' + scope);
    const files = await fs.promises.readdir(nodeModulesPath);
    for (const file of files) {
        const dependencyModulePath = path.join(nodeModulesPath, file);
        let moduleConfig = {};
        try {
            moduleConfig = await onitFileLoader.load(dependencyModulePath);
            console.log('[WEBPACK] ' + moduleName + ' - trovata dipendenza ' + scope + '/' + file + ' in ' + dependencyModulePath);
            const thisModuleConfig = _.get(moduleConfig, 'json.export.webpack', {});
            config = _.mergeWith(config, thisModuleConfig, webpackMergeFn);
        } catch (error) {
            // if the module don't have a onitBuild file, just skip
            if (!error.notFound) {
                throw (error);
            }
        }
    }

    return config;
};

/**
 * Scan the dev environment to find for webpack.json files.
 * These ones in our env keep data of entry points.
 * These data is then merged into one single bigger webpack config json
 *
 */
const searchEntryPoints = (context, searchSubDirs) => {
    // search in these subdirs of the provided one.
    searchSubDirs = searchSubDirs || ['client', 'static'];

    // search for webpack entry points: files from context/config.path/.../react/webpack.json
    const entryPoints = {};
    const regex = /[\\/]webpack\.json$/;

    const files = searchSubDirs.reduce((files, subdir) => {
        subdir = path.resolve(context, subdir);
        if (fs.existsSync(subdir)) {
            files.push(...find.fileSync(regex, subdir));
        }
        return files;
    }, []);

    files.forEach(f => {
        const file = require(f);
        Object.keys(file.entry || {}).forEach(epKey => {
            const id = path.relative(context, path.resolve(path.dirname(f), epKey));
            const name = path.resolve(path.dirname(f), file.entry[epKey]);
            entryPoints[id] = name;
        });
    });

    return entryPoints;
};

/**
 * Merge function for webpack config. NOTE: this function will be called by lodash mergeWith.
 * The only extra stuff this fn does is to concat arrays, other stuff is managed automatically by _.merge.
 * @param {*} dst
 * @param {*} src
 */
const webpackMergeFn = (dst, src) => {
    if (Array.isArray(dst)) return dst.concat(src);
    return undefined;
};

module.exports.searchEntryPoints = searchEntryPoints;
module.exports.webpackMergeFn = webpackMergeFn;
module.exports.buildWebpackConfig = buildWebpackConfig;
