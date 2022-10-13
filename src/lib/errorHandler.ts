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

import { StringError } from '../types';
import { logger } from './logger';

export function errorHandler(error: unknown) {

    // Nel caso di StringError stampa solo il messaggio
    if (error instanceof StringError) {
        logger.error(error.message);
        return;
    }

    // in tutti gli altri casi stampa tutto
    logger.error(error);
}