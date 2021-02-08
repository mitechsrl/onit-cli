const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const onitFileLoader = require('../onitFileLoader');
const find = require('find');
const persistent = require('../../lib/persistent');

/**
*
* @param {*} onitBuildFile
*/
const getWebpackExportsFromDependencies = async (context, onitBuildFile) => {
    const moduleName = path.basename(context);

    let config = _.get(onitBuildFile, 'json.export.webpack', {});

    // build mode. Check for dependencies and load their exports.
    // Dependencies are searched on this folder or ancestors
    const dependencies = _.get(onitBuildFile, 'json.dependencies', []);

    const linkTags = persistent.get('dependency-link');
    for (const dependency of dependencies) {
        let dependencyModulePath = null;
        let found = false;
        // search for paths from depencency links
        if (linkTags[dependency]) {
            dependencyModulePath = linkTags[dependency];
            found = true;
        }

        if (found === false) {
            // FIXME: occhio al trattino in mitown!!!
            let _dep = dependency;
            if (_dep === 'mit-own') {
                _dep = 'mitown';
            }
            dependencyModulePath = path.resolve(context, './node_modules/@mitech/' + _dep);
            while (true) {
                if (fs.existsSync(dependencyModulePath)) {
                    found = true;
                    break;
                }
                const _p = path.resolve(dependencyModulePath, '../../../../node_modules/@mitech/' + _dep);
                // no more top dirs available
                if (_p === dependencyModulePath) break;
                dependencyModulePath = _p;
            }
        }

        if (found === false) {
            dependencyModulePath = path.resolve(context, dependency);
            while (true) {
                if (fs.existsSync(dependencyModulePath)) {
                    found = true;
                    break;
                }
                const _p = path.resolve(dependencyModulePath, '../../' + dependency);
                // no more top dirs available
                if (_p === dependencyModulePath) break;
                dependencyModulePath = _p;
            }
        }

        // dependency module found. get his exports
        if (found) {
            console.log('[WEBPACK] ' + moduleName + ' - trovata dipendenza ' + dependency + ' in ' + dependencyModulePath);
            let buildData = null;
            try {
                buildData = await onitFileLoader.load('build', dependencyModulePath);
            } catch (error) {
                // if the module don't have a onitBuild file, just skip
                if (!error.notFound) throw (error);
            }
            const thisModuleConfig = _.get(buildData, 'json.export.webpack', {});
            config = _.mergeWith(config, thisModuleConfig, webpackMergeFn);
        } else {
            throw new Error('Dipendenza ' + dependency + ' non trovata');
        }
    };

    return config;
};

/**
 * Scan the dev environment to find for webpack.json files.
 * These ones in our env keep data of entry points.
 * These data is then merged into one single bigger webpack config json
 *
 */
const searchEntryPoints = (context) => {
    // search in these subdirs of the provided one.
    const searchSubDirs = ['client', 'static'];

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
module.exports.getWebpackExportsFromDependencies = getWebpackExportsFromDependencies;
