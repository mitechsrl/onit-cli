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

import yargs from 'yargs';
import { NotFoundError, StringError } from '../types';
import { logger } from './logger';

export function errorHandler(error: unknown, argv?: yargs.ArgumentsCamelCase<unknown>) {

    // on verbose, print all the error
    if (argv?.verbose){
        logger.error(error);
        return;
    }

    // Simple StringError. Print only message, skip stack
    if (error instanceof StringError) {
        logger.error(error.message);
        return;
    }

    // Something was not found. The error message should already contain all the needed info
    // no need to print stack trace.
    if (error instanceof NotFoundError){
        logger.error(error.message);
        return;
    }

    // any other case will also print stack trace
    logger.error(error);
}