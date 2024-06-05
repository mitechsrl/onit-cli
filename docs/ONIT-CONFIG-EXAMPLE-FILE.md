# Onit config example file

The onit config file must export one of the following values:

- Object (see below example)
- Sync/async function which must return an object(see below example for object properties)

   ```js
   module.exports = async ()=> {
    // return an object. Equal to the example below
   } 
   ```

- Promise. Must resolve with an object (see below example)

  ```js
   module.exports = Promise.resolve({
     // object. Equal to the example below
   })
   ```

## Example

```js

module.exports = {
    // set component as true for onit extension components
    component: true,

    // For lb4 based onit, both serve and build V3 are required.
    // For specific serve or build versions, set serve.version or build.version
    version: '^3.0.0',

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
            './src/**/*.ejs',
            './src/**/*.json'
        ]
    },

    /**
     * Select th engines to be run
    */
    engines: {
        // backend engines. Only lb4 is available currently. Set te engine to false to disable backend builds
        // defaults to {'lb4':true}
        backend: {
            'lb4': true, 
        }
        // frontend engines. You can also set this value to false to disable frontend builds. 
        // Multiple engines can be set at once.
        // defaults to {'onit-webpack':true}
        frontend: {
            // legacy mode (custom webpack + file structure).
            'onit-webpack':true,
            // nextjs-based frontends
            'nextjs':true
        }
    }
    
    /**
     * Serve configuration
     */
    serve: {
        // array of paths to be scanned for components. Optional.
        // componentsScanDirs: []
        
        // main file to launch for serve. Defaults to onit index file
        // main:'',
        
        // node main process arguments. Passed as-is to node process
        // nodeArgs: []
        
        // prints potential @mitech packages conflicts
        // checkPackageLockPotentialConflicts: true
        
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
        }
    },

    /**
     * Build configuration
     */
    build: {
        targets: {
            Production: {
                mode: 'production', // production, uat, beta, test
                version: {
                    additional: {
                        // a command which must ouput a npm version code (MAJ.MIN.PATCH).
                        // The system propose the next one available based on this
                        name: 'Check version from npm',
                        cmd: 'npm view "$_PACKAGE_NAME" versions --json'
                    }
                }
                afterSteps: [
                    {
                        name: 'Commit and tag version with git',
                        cmd: [
                            'git add package*.json',
                            'git commit -m "V$_PACKAGE_VERSION"',
                            'git tag V$_PACKAGE_VERSION',
                            'git push origin V$_PACKAGE_VERSION'
                        ]
                    }
                ]
            }
        }
    },

    /**
     * Test config. See ONIT-TEST.md
     */
    test: {
        "nomeSet":{ 
            
            // Environent params for test onit launcher
            "environment":{}
            
            // Test-specific parameters
            "startup":"someFile.js",
            "beforeTest":"someFile2.js"
            "testFilesDirectories":["./src/test/cases", "../../onit-next/dist/test/cases"], // mocha test files directories 
            "shutdown": "pathToFile.js"
            
            // Add any mocha-supported property. See list here: https://mochajs.org/api/mocha,
            // These properties are passed down directly to mocha.
            "grep":"*", // https://mochajs.org/api/mocha#grep
            "timeout": "10s", //https://mochajs.org/api/mocha#timeout
        }
    },


    /**
     * translation config. See ONIT-LABELS.md 
     */
    translate: {
        // replace these words before translating 
        synomns: [
            // replaces hi with hello
            { word: 'hi', syn: 'hello' },
        ],
        // do not translate these labels (exact-text match, like /^Error$/)
        skip: [
            'Error'
        ],
        // destination language codes
        languages:['de_DE','fr_FR']
    }
}
```
