import { writeFileSync, unlinkSync, statSync, rmSync } from 'fs';
import { join } from 'path';
import { GenericObject } from '../../../../types';

export async function removeUnwantedFiles(cwd:string, answers: GenericObject) {
    // files to be deleted
    const deleteFiles = [
        './src/controllers/onit-demo',
        './src/client/routes/demo',
        './src/models/demo.model.ts',
        './src/repositories/demo.repository.ts'
    ];

    for (const file of deleteFiles) {
        const filename = join(cwd, file);
        try {
            const stat = statSync(filename);
            if (stat.isDirectory()) {
                rmSync(filename, { recursive: true });
            } else {
                unlinkSync(filename);
            }
        } catch (e) {
            console.warn(`[WARNING] Could not delete file "${filename}": not found.`);
        }
    }

    // files to be made empty
    const emptyFiles = [
        './src/controllers/index.ts',
        './src/models/index.ts',
        './src/repositories/index.ts'
    ];
    for (const file of emptyFiles) {
        const filename = join(cwd, file);
        writeFileSync(filename, '');
    }
}
