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
exports.header = void 0;
const logger_1 = require("./logger");
const packageJson_1 = require("./packageJson");
function header() {
    logger_1.logger.info('');
    logger_1.logger.info('    &&&&&&       &&&&&&                      ');
    logger_1.logger.info('    &&&&&&&     &&&&&&&  &&&&                ');
    logger_1.logger.info('    &&&&#&&&   &&& &&&&   &&&&&&&            ');
    logger_1.logger.info('    &&&& &&&   &&& &&&&      &&&&&&&&        ');
    logger_1.logger.info('    &&&& &&&& &&&& &&&&          &&&&&&      ');
    logger_1.logger.info('    &&&&  &&& &&&  &&&&      &&&&&&&&        ');
    logger_1.logger.info('    &&&&  &&&&&&&  &&&&   &&&&&&&            ');
    logger_1.logger.info('    &&&&   &&&&&   &&&&  &&&&                ');
    logger_1.logger.info('    &&&&   &&&&&   &&&&                      ');
    logger_1.logger.info('');
    logger_1.logger.info('Mitech CLI tool ' + packageJson_1.packageJson.version);
    logger_1.logger.log('Add -h flag for more info');
    // logger.log('Config files dir ' + persistent.baseConfigDir);
}
exports.header = header;
//# sourceMappingURL=header.js.map