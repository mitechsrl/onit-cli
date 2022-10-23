"use strict";
/**
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 * Copyright (C) 2004 Sam Hocevar
 * 22 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION:
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const types_1 = require("../types");
const logger_1 = require("./logger");
function errorHandler(error, argv) {
    // on verbose, print all the error
    if (argv === null || argv === void 0 ? void 0 : argv.verbose) {
        logger_1.logger.error(error);
        return;
    }
    // Simple StringError. Print only message, skip stack
    if (error instanceof types_1.StringError) {
        logger_1.logger.error(error.message);
        return;
    }
    // Something was not found. The error message should already contain all the needed info
    // no need to print stack trace.
    if (error instanceof types_1.NotFoundError) {
        logger_1.logger.error(error.message);
        return;
    }
    // any other case will also print stack trace
    logger_1.logger.error(error);
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map