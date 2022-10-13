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

import { logger } from './logger';
import { packageJson } from './packageJson';

export function header() {

    logger.info('');
    logger.info('    &&&&&&       &&&&&&                      ');
    logger.info('    &&&&&&&     &&&&&&&  &&&&                ');
    logger.info('    &&&&#&&&   &&& &&&&   &&&&&&&            ');
    logger.info('    &&&& &&&   &&& &&&&      &&&&&&&&        ');
    logger.info('    &&&& &&&& &&&& &&&&          &&&&&&      ');
    logger.info('    &&&&  &&& &&&  &&&&      &&&&&&&&        ');
    logger.info('    &&&&  &&&&&&&  &&&&   &&&&&&&            ');
    logger.info('    &&&&   &&&&&   &&&&  &&&&                ');
    logger.info('    &&&&   &&&&&   &&&&                      ');

    logger.info('');
    logger.info('Mitech CLI tool ' + packageJson.version);
    logger.log('Add -h flag for more info');
    // logger.log('Config files dir ' + persistent.baseConfigDir);
}