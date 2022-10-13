const { writeFileSync, unlinkSync, statSync, rmSync } = require('fs');
const { join } = require('path');

module.exports.removeUnwantedFiles = async function (cwd, answers) {
    // files to be deleted
    const deleteFiles = [
        './src/controllers/onit-demo',
        './src/client/routes/demo',
        './src/models/demo.model.ts',
        './src/repositories/demo.repository.ts'
    ];

    for (const file of deleteFiles) {
        const filename = join(cwd, file);
        const stat = statSync(filename);
        if (stat.isDirectory()) {
            rmSync(filename, { recursive: true });
        } else {
            unlinkSync(filename);
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
};
