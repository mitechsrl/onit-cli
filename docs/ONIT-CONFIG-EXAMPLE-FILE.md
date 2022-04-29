```js

module.exports = {
    // set component as true for onit extension components
    component: true,

    // For lb4 based onit, both serve and build V2 are required.
    // For specific serve or build versions, set serve.version or build.version
    version: '2.0.0',

    /**
     * Tsc does not manage other files than the .ts ones. We need to copy some other files to make things work.
     * This copyFile instruction is managed by onit-cli, and copy these files from src to dist with the logic:
     * - Full copy files after first successfull tsc build
     * - watch them to re-copy at changes
     * File path is mainteined, so ./src/path/to/file.ext is copied into ./dist/path/to/file.ext
     */
    copyFiles: {
        // GLOB syntax
        from: './src',
        to: './dist',
        glob: [
            './src/**/*.ejs'
        ]
    },

    /**
     * Serve configuration
     */
    serve: {
        // array of paths to be scanned for components. Optional.
        //componentsScanDirs: []
        
        // main file to launch for serve. Defaults to onit index file
        //main:'',
        
        // node main process arguments
        // nodeArgs: []
        
        // env variables for the node process to be launched
        environment: {
            DATASOURCES: {
                ds: {
                    connector: 'mongodb',
                    host: 'localhost',
                    port: 27017,
                    database: 'my-database',
                    useNewUrlParser: true
                }
            }
        },
        // pm2 ecosystem to be launched before serving the app
        'pm2-dev-ecosystem': {
            apps: [
                {
                    name: 'some-app',
                    script: 'index.js',
                    watch: false,
                    max_memory_restart: '512M',
                    cwd: './some-app/',
                    exec_mode: 'fork',
                    shutdown_with_message: true
                }
            ]
        }
    },

    /**
     * Build configuration
     */
    build: {
        targets: {
            Production: {
                mode: 'production', // uat, beta, test
                version: {
                    additional: {
                        name: 'Versione successiva da repository npm',
                        cmd: 'npm view "$_PACKAGE_NAME" versions --json'
                    }
                }
                afterSteps: [
                    {
                        name: 'Publish npm mitech',
                        cmd: 'mitech npm publish -y'
                    },
                    {
                        name: 'Commit and tag version with git',
                        cmd: [
                            'git add package.json',
                            'git add package-lock.json',
                            'git commit -m "V$_PACKAGE_VERSION"',
                            'git tag V$_PACKAGE_VERSION',
                            'git push origin V$_PACKAGE_VERSION'
                        ]
                    }
                ]
            }
        }
    }
}
```