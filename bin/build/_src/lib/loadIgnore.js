const ignore = require('ignore');
const fs = require('fs');
const path = require('path');



module.exports = () => {

    const _load = function(ignoreFileName){
        // prepara gestione ignore files
        let ignoreFile = '';

        if (fs.existsSync(ignoreFileName)) {
            ignoreFile = fs.readFileSync(ignoreFileName).toString();
        }

        const ignoreFilters = ignoreFile
            .split('\n')
            .map(v => v.trim())
            .filter(v => v !== '')
            .filter(v => v[0] !== '#');


        return ignoreFilters;
    }
    
    let ignoreFilters = [
        ..._load(path.join(process.cwd(), './.onitbuildignore')),
        ..._load(path.join(__dirname, '../../../../configFiles/build/.defaultignore'))
    ];

    return ignore().add(ignoreFilters);
}