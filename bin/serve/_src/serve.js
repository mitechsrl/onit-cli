const EventEmitter = require('events');
const pm2Dev = require('./lib/pm2');
const nodemon = require('./lib/nodemon');
const webpack = require('./lib/webpack');
const onitFileLoader = require('../../../lib/onitFileLoader');

module.exports.serve = async function (logger, params) {

    
    const minusW = params.get('-w').found;
    const minusN = params.get('-n').found;

    // processi da eseguire IN PARALLELO per lo start
    // vedi https://nodejs.org/api/child_process.html#child_process_subprocess_stdio per gestione STDIO
    /*const serve = [
        { cmd: 'nodemon' + ext + ' --config ./dev-utils/nodemon-dyn.json', stdio: ['inherit', 'inherit', 'inherit'] },
        { cmd: 'node ./dev-utils/frontend-webpack.js --live' }
    ];*/

    // avvia processo di start

    try {

        const onitRunFile = await onitFileLoader.load('run');
        const onitBuildFile = await onitFileLoader.load('build');

        // pre-serve: run sequentially waiting for each async resolve
        logger.log("Eseguo <Nodemon startup>...");
        await pm2Dev.start();

        
        // tempo di lanciare il serve effettivo
        logger.log("Lancio nodemon & webpack..."+ (minusN ? 1:0) + (minusW ? 1:0))
        await Promise.all([
            (!minusN) ? webpack.start(logger, onitRunFile, onitBuildFile) : Promise.resolve(),  // -n cause only webpack to be run live
            (!minusW) ? nodemon.start(logger, onitRunFile) : Promise.resolve() // -w cause only webpack to be run live
        ]);

        // lancio tutto quello che c'è in parallelo. Passare il filename di nodemon
        //await promisify.parallelize(serve.map(cmd => runProcess(cmd)), 1000);

        // after-serve: run sequentially waiting for each async resolve
        logger.log("Eseguo <Nodemon shutdown>...");
        await pm2Dev.stop();

        // bye!
        logger.error("Exit serve...");
        process.exit(0);
    } catch (e) {
        logger.error(e.message);
        logger.error("Run interrotto");
        process.exit(-1);
    }
}