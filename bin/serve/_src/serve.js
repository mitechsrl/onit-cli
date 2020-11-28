
const pm2Dev = require('./lib/pm2');
const nodemon = require('./lib/nodemon');
const webpack = require('./lib/webpack');
const onitFileLoader = require('../../../lib/onitFileLoader');

module.exports.serve = async function (logger, params) {
    const minusW = params.get('-w').found;
    const minusN = params.get('-n').found;


    try {
        const onitRunFile = await onitFileLoader.load('run');
        const onitBuildFile = await onitFileLoader.load('build');

        // pre-serve: run sequentially waiting for each async resolve
        logger.log('Eseguo <Nodemon startup>...');
        const launchedCount = await pm2Dev.start(onitRunFile);

        // tempo di lanciare il serve effettivo
        const message = [(!minusN ? 'webpack' : ''), (!minusW ? 'nodemon' : '')].filter(m => !!m).join(' e ');
        logger.log('Lancio ' + message + '...');
        await Promise.all([
            (!minusN) ? webpack.start(logger, onitRunFile, onitBuildFile) : Promise.resolve(), // -n cause only webpack to be run live
            (!minusW) ? nodemon.start(logger, onitRunFile) : Promise.resolve() // -w cause only webpack to be run live
        ]);

        // lancio tutto quello che c'è in parallelo. Passare il filename di nodemon
        // await promisify.parallelize(serve.map(cmd => runProcess(cmd)), 1000);

        if (launchedCount > 0) {
            // after-serve: run sequentially waiting for each async resolve
            logger.log('Eseguo <Nodemon shutdown>...');
            await pm2Dev.stop();
        }
        // bye!
        logger.error('Exit serve...');
        process.exit(0);
    } catch (e) {
        logger.error(e.message);
        logger.error('Run interrotto');
        process.exit(-1);
    }
};
