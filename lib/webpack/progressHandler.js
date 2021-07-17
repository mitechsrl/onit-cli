// progress message handler
let _debounceMessage = '';
module.exports = (componentName, logger) => (percentage, message, ...args) => {
    if ((percentage < 0.99) && (message !== _debounceMessage)) {
        const p = (percentage * 100).toFixed(0);
        _debounceMessage = message;
        logger.warn('[WEBPACK] ' + componentName + ' build ' + p + '% ' + message);
    }
};
