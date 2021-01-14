const semverSatisfies = require('semver/functions/satisfies');

if (process.argv.length < 4) {
    console.log('Usage: node semver.js rangeVersion targetVersion');
} else {
    console.log('range = ' + process.argv[2]);
    console.log('version = ' + process.argv[3]);
    console.log('');

    console.log(semverSatisfies(process.argv[3], process.argv[2]) ? 'version SATISFIES range' : 'version DO NOT SATISFIES range');
}
