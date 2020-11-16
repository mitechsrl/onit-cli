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
            if (previousFilesDuplicates.length>0) {
                doSave = true;
                logger.log('Duplicati da files precedenti: ' + previousFilesDuplicates.length);
            }
            if (duplicates.length > 0) {
                doSave = true;
                logger.log('Duplicati nello stesso file trovati: ' + duplicates.length);
            }
            if (doSave) {
                
                json.labels = Object.values(map).map(m => m.label);
                if (json.labels.length === 0){
                    logger.warn("File risultante vuoto. Il file verrà rimosso.")
                    fs.unlinkSync(filename);
                }else{
                    fs.writeFileSync(filename, JSON.stringify(json, null, 4));
                }
            }

            allLabels = _allLabels;
        }
    });
};
