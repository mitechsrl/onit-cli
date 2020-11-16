const fs = require('fs');
const path = require('path');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname,'../package.json').toString()))

const baseConfigDir = path.join(process.env.APPDATA, './'+packageJson.name);
module.exports.baseConfigDir = baseConfigDir;

const checkDir = function (key) {
    const mitechCliDbPath = baseConfigDir;
    if (!fs.existsSync(mitechCliDbPath)) {
        fs.mkdirSync(mitechCliDbPath);
    }

    if (key) {
        const keyPath = path.join(mitechCliDbPath, './' + key);
        if (!fs.existsSync(keyPath)) {
            fs.mkdirSync(keyPath);
        }
    }
};

module.exports.get = function (key, filename) {
    checkDir(key);

    let _filename = baseConfigDir;
    if (key) {
        _filename = path.join(_filename, './' + key);
    }

    _filename = path.join(_filename, './' + (filename || 'config.json'));

    if (!fs.existsSync(_filename)) {
        fs.writeFileSync(_filename, '{}');
        return {};
    } else {
        return JSON.parse(fs.readFileSync(_filename));
    }
};

module.exports.set = function (key, obj, filename) {
    checkDir(key);

    let _filename = baseConfigDir;
    if (key) {
        _filename = path.join(_filename, './' + key);
    }

    _filename = path.join(_filename, './' + (filename || 'config.json'));

    // console.log('File: ' + _filename);
    fs.writeFileSync(_filename, JSON.stringify(obj, null, 4));
};
