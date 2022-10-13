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

import path from 'path';
import { SshTarget } from '../types';
import { logger } from './logger';
import { runLinuxConfiguration } from './runLinuxConiguration';
import { createSshSession } from './ssh';

/**
 * Seleziona una configurazione dalla directory configPaths e la esegue su target remoto
 * @param {*} target target remoto
 * @param {*} configPaths directory dove cercare le configurazioni
 */
export async function runTargetConfiguration (target :SshTarget, configPaths: string) {
    let session = null;
    try {
        session = await createSshSession(target);
        if (session.os.linux) {
            await runLinuxConfiguration(session, path.join(configPaths, './linux'));
        } else {
            throw new Error('Setup script non disponibile per la piattaforma ' + JSON.stringify(session.os));
        }
    } catch (error) {
        logger.error(error);
    }

    if (session) session.disconnect();
}