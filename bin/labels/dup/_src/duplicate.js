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
const find = require('find');
const fs = require('fs');
const _ = require('lodash');

module.exports.checkDirectory = function (dir, logger) {
    const files = find.fileSync(dir);

    files.sort();

    let allLabels = {};

    files.forEach(filename => {
        if (filename.endsWith('.json')) {
            logger.log('Verifica file ' + filename);
            const json = JSON.parse(fs.readFileSync(filename).toString());
            if (!json.labels) {
                logger.warn('Non è un file labels. Skip.');
                return;
            }
            const _allLabels = _.cloneDeep(allLabels);
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
                logger.log('Duplicati da files precedenti: ' + previousFilesDuplicates.length);
            }
            if (duplicates.length > 0) {
                doSave = true;
                logger.log('Duplicati nello stesso file trovati: ' + duplicates.length);
            }
            if (doSave) {
                json.labels = Object.values(map).map(m => m.label);
                if (json.labels.length === 0) {
                    logger.warn('File risultante vuoto. Il file verrà rimosso.');
                    fs.unlinkSync(filename);
                } else {
                    fs.writeFileSync(filename, JSON.stringify(json, null, 4));
                }
            }

            allLabels = _allLabels;
        }
    });
};
