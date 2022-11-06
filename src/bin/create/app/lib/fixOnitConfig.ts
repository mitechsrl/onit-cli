import { GenericObject } from '../../../../types';
import { join } from 'path';
import { replaceInFile } from './replaceInFile';

export async function fixOnitConfig(cwd:string, answers: GenericObject) {
    // replace database name in onit.config.js
    await replaceInFile(
        join(cwd, './onit.config.js'),
        /^(.*database: +['"]{1,1})[a-zA-Z0-9-_]+(['"]{1,1}.*)/mg,
        `$1${answers.databaseName}$2`);
}
