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

import fs from 'fs';
import { GenericObject } from '../../../../types';

export async function scanLabals(filename:string){

    const fileContent = fs.readFileSync(filename).toString();

    // const regex = /i18n\(([^\)]+)\)/g;
    const regex = /i18n\(([^)]+)\)/g;

    let m;
    let labels: GenericObject[] = [];

    while ((m = regex.exec(fileContent)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
        // console.log(`Found match, group ${groupIndex}: ${match}`);
            if (groupIndex > 0) {
                labels.push({
                    language: 'it_IT',
                    label: match.replace(/'/g, '').replace(/"/g, ''),
                    text: match.replace(/'/g, '').replace(/"/g, ''),
                    page: 'CHANGE_ME'
                });
            }
        });
    }

    labels = labels.filter(function (item1, pos) {
        return labels.findIndex(item2 => item1.label === item2.label) === pos;
    });

    console.log(JSON.stringify(labels, null, 4));

}