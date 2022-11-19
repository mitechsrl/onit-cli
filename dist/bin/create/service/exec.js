"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const CustomServiceGenerator_1 = require("./_lib/CustomServiceGenerator");
// @loopback-cli is not a library, there's not typings
// We are just leveraging on some implementation to reuse them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ServiceGenerator = require('@loopback/cli/generators/service/index');
const exec = async (argv) => {
    const generator = new CustomServiceGenerator_1.CustomServiceGenerator();
    // NOTE: the orignal class methods were run with yeoman.
    // Yeoman runs sequentially the class mehods. Imitating it with this code.
    for (const method of Object.getOwnPropertyNames(ServiceGenerator.prototype)) {
        // NOTE1: skipping checkLoopBackProject to avoid dependency checks. We just need to create the model file
        // NOTE2: skipping methods starting with _. Those are private.
        if (['constructor', 'checkLoopBackProject'].includes(method) || method.startsWith('_'))
            continue;
        await generator[method]();
    }
};
exports.default = exec;
//# sourceMappingURL=exec.js.map