# Copy files

Onit-cli can copy arbitrary files from any directory to any directory at the end of the typescript build. This utility was specifically created to copy json/ejs files from **./src** to **./dist** directory after each build, but was then extended to any arbitrary file.

The copy file processs is run in these cases:
- project build (onit build, after successfull tsc build)
- project run (onit serve, after successfull tsc build)


To enable it, add the section to your **onit.config.js** file.


```js
module.exports = {
    copyFiles: {
        from: './src', // source directory from whichcopy files
        to: './dist', // desination directory into which copy files
        glob: [
            // files matchers. Use glob syntax
            './src/**/*.ejs',
            './src/**/*.json'
        ]
    }
}
```

