const logger = require('./logger');

module.exports.printError = (e) => {
    // -vv print verbose errors
    if (process.argv.find(arg => arg === '-vv')) {
        logger.error(e);
    } else {
        logger.error(e.message || e);
    }
};
