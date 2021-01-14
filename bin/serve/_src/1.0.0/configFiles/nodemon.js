module.export = {
    verbose: false,
    ext: 'js,json,jsonc',
    ignore: [
        'node_modules/*', // never ever watch any node_module dir
        '*/node_modules/*',
        'extras/*', // this is a placeholder folder for generic project-related files. Don't watch it.
        '*/react/*', // changes to react folders do not cause reloads since they are managed by webpack
        'dev-utils/*', // changes to dev utils do not cause reloads since they are called by npm scripts
        'git.json', // git.json statis file. Probably removed in future
        '*/static/*', // any static folder don't cause reloads
        'assets/*', // static assets changes don't cause reloads
        'dist-fe/*' // target directory for webpack compiled files. Don't reload on these files changes
    ],
    nodeArgs: [],
    env: {}
};
