const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const spawn = require('../../../../lib/spawn');

const onitFileLoader = require('../../../../lib/onitFileLoader');

// windows fa il windows percui lui vuole 'pm2.cmd' anzichè 'pm2' come comando di avvio
const isWindows = (process.env.OS || '').toUpperCase().includes('WIN');
const pm2exec = isWindows ? 'pm2.cmd' : 'pm2';


module.exports.stop = function() {
    return spawn(pm2exec, ['stop', 'all'], true);
}

module.exports.start = () => {
    
    return new Promise(async (resolve,reject) => {


        const onitRunFile = await onitFileLoader.load('run');

        // preparo ecosystem file temporaneo
        let pm2Ecosystem = onitRunFile.json['pm2-dev-ecosystem'];
        if (!pm2Ecosystem) {
            pm2Ecosystem = { apps: [] };
        }

        // filter out apps based on enableOn
        pm2Ecosystem.apps = (pm2Ecosystem.apps || []).filter(app => {
            let enabled = true;
            if (app.enableOn && (Object.keys(app.enableOn).length > 0)) {
                Object.keys(app.enableOn).forEach(v => {
                    const value = _.get(pm2Ecosystem.environment, v, null);
                    if (value !== app.enableOn[v]) {
                        enabled = false;
                    }
                });
            }
            return enabled;
        });

        // c'è qualche app da lanciare?
        if (pm2Ecosystem.apps.length  === 0) {
            console.log('Nessuna app da lanciare con PM2. Skip passaggio');
            return resolve(0);
        }

        const temporaryEcosystemFile = onitRunFile.filename + '-pm2-ecosystem.json';
        fs.writeFileSync(temporaryEcosystemFile, JSON.stringify(pm2Ecosystem, null, 4));

        try{
            // rimuovo ecosystem caricato in precedenza prima di rilanciare tutto
            await spawn(pm2exec, ['delete', 'all'],false);

            // pm2 delete all fatto. ora lancio ecosystem attuale
            const {exitCode, data} = await spawn(pm2exec, ['start', temporaryEcosystemFile],false);
            return resolve(exitCode);
        }catch(e){
            return reject(error);
        }
    })
}
