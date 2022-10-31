const globAll = require('glob-all');
const path = require('path');

/**
 * Find all files with glob.
 *
 * @param {*} config
 * @param {*} cwd
 * @returns Array of {file: string, parser:string} objects.
 * parser is the name of theparser expected to be used to process the file
 * file is the absolute path of the file to be prrocessed
 */
function findFiles (config, cwd = process.cwd()) {
    const options = {
        ignore: [
            './node_modules/**/*',
            './dist/**/*',
            ...(config.ignore || [])
        ],
        cwd: cwd
    };

    // setup which files must be parsed and the relative parser. See https://en.wikipedia.org/wiki/Glob_(programming) for glob patterns
    const globList = [
        // { extension: '.js', glob: ['./**/*.js', './**/*.JS'], parser: path.join(__dirname, './parsers/javascript.js') },
        { extension: '.ts', glob: ['./**/*.ts', './**/*.TS'], parser: 'typescript' },
        // { extension: '.jsx', glob: ['./**/*.jsx', './**/*.JSX'], parser: path.join(__dirname, './parsers/javascript.js') },
        { extension: '.md', glob: ['./**/*.md', './**/*.MD'], parser: 'markdown' },
        ...(config.globList || []) // add globs from config file
    ];

    // create a unique glob list for the glob package
    const _globList = globList.filter(g => g.glob) // skip empty globs for.... reasons
        .reduce((a, g) => {
            a.push(...(Array.isArray(g.glob) ? g.glob : [g.glob]));
            return a;
        }, []);

    return new Promise((resolve, reject) => {
        globAll(_globList, options, function (err, files) {
            if (err) { return reject(err); }

            resolve(files.map(f => {
                return {
                    file: path.resolve(cwd, f),
                    parser: (globList.find(l => f.toLowerCase().endsWith(l.extension.toLowerCase())) || {}).parser
                };
            }));
        });
    });
}

exports.findFiles = findFiles;
