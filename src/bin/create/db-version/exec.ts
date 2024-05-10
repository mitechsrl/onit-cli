/*
Copyright (c) 2021 Mitech S.R.L.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

import yargs from 'yargs';
import { CommandExecFunction, StringError } from '../../../types';
import { join } from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import ejs from 'ejs';
import { logger } from '../../../lib/logger';
import { confirm } from '../../../lib/confirm';

/**
 * 
 * @param argv 
 * @returns 
 */
const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    
    const packageJsonPath= join(process.cwd(), './package.json');
    const versionsFilePath = join(process.cwd(), './src/boot/versions.ts');

    if (!existsSync(packageJsonPath)) {
        throw new Error('package.json not found in current directory');
    }
    if (!existsSync(versionsFilePath)) {
        throw new Error('File ./src/boot/versions.ts not found. Please run this command in a valid onit-based project directory');
    }

    // IV: The correct way to change the file is by using typescript compiler API, but it's quite long and complex.
    // Doing it using a way too much dumber processing for now.
    let fileContent = readFileSync(versionsFilePath, 'utf8').toString();
    const regex = /assertDbInitVersions\([ \n\t]*{([^}]+)}[ \n\t]*\)/gs;

    const matched = regex.exec(fileContent);
    if (!matched) throw new StringError('Couldn\'t find the assertDbInitVersions function in the file');

    const functionParamContent = matched[1];

    // indentation
    const indentation = functionParamContent.trimEnd()
        .replace(functionParamContent.trim(),'')
        .replace(/\n/g,'')
        .replace(/\r/g,'');

    // Extract current versions
    const versionMatchRegex = /['"]([0-9]+)\.([0-9]+)\.([0-9a-fA-F]+)['"]([^\n]+)/g;
    let v;
    const versions: { a:string,b:string,c:string, rest:string }[]= []; 
    while(null != (v =versionMatchRegex.exec(functionParamContent))) {
        versions.push({ 
            a:v[1],
            b:v[2],
            c:v[3],
            rest: v[4] ? v[4].trim().replace(/,$/gm,'').replace(/\n/g,'').replace(/\r/g,''): ''
        });
    }

    // Sort versions
    versions.sort((a,b)=> {
        const _a = a.a.padStart(6,'0')+a.b.padStart(6,'0')+a.c;
        const _b = b.a.padStart(6,'0')+b.b.padStart(6,'0')+b.c;
        return _a === _b ? 0 : _a < _b ? 1 : -1;
    });

    // Generate new version
    const lastVersion = versions[0];
    const newVersion = { 
        a:lastVersion.a, 
        b:(parseInt(lastVersion.b)+1).toString(), 
        c:new Date().getTime().toString(16),
        rest: `: 'Version generated at ${new Date().toISOString()} via <onit create db-version> command'`
    };
    versions.unshift(newVersion);
    versions.reverse();

    // Get the text to be placed in function call
    const newFunctionParamContent = versions.map(v=>`'${v.a}.${v.b}.${v.c}'${v.rest}`)
        .map(v => `${indentation}${v.trim()}`)
        .filter(v => v.trim().length > 0)
        .join(',\n');
    fileContent = fileContent.replace(functionParamContent, '\n'+newFunctionParamContent+'\n');
    
    // write out the file
    writeFileSync(versionsFilePath, fileContent);

    logger.log(`Generated version ${newVersion.a}.${newVersion.b}.${newVersion.c}`);

    // ask for update file generation
    if (!await confirm('Generate update file for the new version?')) return;

    // render the model file and writer it out
    const template = readFileSync(join(__dirname, './_templates/update.ejs')).toString();
    const versionString = `${newVersion.a}.${newVersion.b}.${newVersion.c}`;
    const updateFilePath = join(process.cwd(), './src/boot/updates');
    const updateFilename = 'update_'+versionString+'.ts';
    mkdirSync(updateFilePath, { recursive: true });
    const rendered = ejs.render(template, { version: versionString });
    writeFileSync(join(updateFilePath,updateFilename), rendered);

    logger.log(`Update file ./src/boot/updates/${updateFilename} generated`);
};

export default exec;