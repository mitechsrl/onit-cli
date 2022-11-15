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

import fs, { writeFileSync } from 'fs';
import path from 'path';

export type ScanCommandResult = {
    cmd: string,
    file: string,
    children: ScanCommandResult[]
};

export async function scanCommands(dir: string, name: string): Promise<ScanCommandResult[]> {

    const replace = path.join(__dirname, '../');
    const files = await fs.promises.readdir(dir);

    const scanResult: ScanCommandResult[] = [];

    for (const fileName of files) {
        if (fileName === 'commandConfig.js') {
            scanResult.push({
                cmd: name,
                file: path.posix.join(dir, fileName).replace(replace,''),
                children: []
            });
        }
    }

    const found = scanResult.length > 0;

    for (const fileName of files) {
        if (!fileName.startsWith('_')) {
            const f = path.posix.join(dir, fileName);
            const stat = await fs.promises.stat(f);
            if (stat.isDirectory()) {
                const _f = await scanCommands(f, fileName);
                if (found) {
                    scanResult[0].children.push(..._f);
                } else {
                    scanResult.push(..._f);
                }
            }
        }
    }

    return scanResult;
}

