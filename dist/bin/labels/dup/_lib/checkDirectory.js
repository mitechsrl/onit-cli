"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDirectory = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const util_1 = require("util");
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../../../../lib/logger");
// This lib does not have typescript typings
// eslint-disable-next-line @typescript-eslint/no-var-requires
const globAll = require('glob-all');
async function checkDirectory(dir) {
    // search for json files
    const options = {
        cwd: dir,
        ignore: [
            './**/node_modules/**/*',
            './**/package.json',
            './**/tsconfig.json'
        ]
    };
    let files = await (0, util_1.promisify)(globAll)(['./**/*.json'], options);
    // make sure we have absolute paths
    files = files.map(f => (0, path_1.resolve)(dir, f));
    files.sort();
    let allLabels = {};
    files.forEach(filename => {
        const json = JSON.parse(fs_1.default.readFileSync(filename).toString());
        if (!json.labels) {
            // Not a labels file. Skip;
            return;
        }
        logger_1.logger.log('Checking file ' + filename);
        const _allLabels = lodash_1.default.cloneDeep(allLabels);
        const map = json.labels.reduce((map, label) => {
            const k = label.page + label.label + label.language + label.applicationId;
            map[k] = map[k] || { label: label, count: 0 };
            map[k].count++;
            _allLabels[k] = _allLabels[k] || { label: label, count: 0 };
            _allLabels[k].count++;
            return map;
        }, {});
        // do previous parsed files already had this label? if so, remove this one
        const previousFilesDuplicates = Object.keys(allLabels).filter(k => !!map[k]);
        previousFilesDuplicates.forEach(k => delete map[k]);
        const duplicates = Object.values(map).filter(m => m.count > 1);
        let doSave = false;
        if (previousFilesDuplicates.length > 0) {
            doSave = true;
            logger_1.logger.log('Duplicates from other files: ' + previousFilesDuplicates.length);
        }
        if (duplicates.length > 0) {
            doSave = true;
            logger_1.logger.log('Duplicates in the same file: ' + duplicates.length);
        }
        if (doSave) {
            json.labels = Object.values(map).map(m => m.label);
            if (json.labels.length === 0) {
                logger_1.logger.warn('Output file is empty. The file will be removed.');
                fs_1.default.unlinkSync(filename);
            }
            else {
                fs_1.default.writeFileSync(filename, JSON.stringify(json, null, 4));
            }
        }
        allLabels = _allLabels;
    });
}
exports.checkDirectory = checkDirectory;
//# sourceMappingURL=checkDirectory.js.map