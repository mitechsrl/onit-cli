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

// const extract = require('./_src/extract');

module.exports.info = 'Utility estrazione labels';
module.exports.help = [
    ['-f filename', 'File da processare']
];
module.exports.catchUnimplementedParams = true;
module.exports.cmd = async function (basepath, params, logger) {
    logger.info('Verifica directory corrente');

    // get the input file: the one marked from -f or the first param
    let inputFile = params.get('-f');
    if (!inputFile.found || !inputFile.value) {
        inputFile = params[0];
    } else {
        inputFile = inputFile.value;
    }

    console.log(inputFile);

    // extract.checkDirectory(process.cwd(), logger);
};
