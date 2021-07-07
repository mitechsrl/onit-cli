/*

Esegue il parsing di un file alla ricerca di labels.
Produce in output un json valido da inserire all'interno del file delle labels, previo completamento manuale

Uso:
node label-extract.js applicationId page filename

esempio
node dev-utils/label-extract.js "#VAR.MITMATERIALCERTIFICATESAPP_ID#" "MitMaterialCertificates/import/views/import"  "C:\Users\Ivan\progetti\mit-own\server\components\mit-material-certificates\client\web\common\routes\import\views\react\import.jsx"
*/

const fs = require('fs');

if (process.argv.length < 5) {
    console.log('Uso: node label-extract.js applicationId page filename');

    // eslint-disable-next-line no-process-exit
    process.exit(0);
}

let file = fs.readFileSync(process.argv[4]);
file = file.toString();

// const regex = /i18n\(([^\)]+)\)/g;
const regex = /i18n\(([^)]+)\)/g;

let m;
let labels = [];

function buildObj (l) {
    return {
        language: 'it_IT',
        label: l.replace(/'/g, '').replace(/"/g, ''),
        text: l.replace(/'/g, '').replace(/"/g, ''),
        page: process.argv[3].replace(/"/g, ''),
        applicationId: process.argv[2].replace(/"/g, '')
    };
}

while ((m = regex.exec(file)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
        // console.log(`Found match, group ${groupIndex}: ${match}`);
        if (groupIndex > 0) {
            labels.push(buildObj(match));
        }
    });
}

labels = labels.filter(function (item1, pos) {
    return labels.findIndex(item2 => item1.label === item2.label) === pos;
});

console.log(JSON.stringify(labels, null, 4));
