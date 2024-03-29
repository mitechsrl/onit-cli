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
exports.babelConfig = void 0;
function babelConfig(env) {
    const plugins = [];
    const isProduction = env === 'production';
    // add plugins for production env only
    if (isProduction) {
        // https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types
        plugins.push([require.resolve('babel-plugin-transform-react-remove-prop-types'), { removeImport: true }]);
    }
    // babel final config
    return {
        cacheDirectory: !isProduction,
        cacheCompression: false,
        plugins: [
            //  https://babeljs.io/docs/en/babel-plugin-proposal-class-properties
            // require.resolve('@babel/plugin-proposal-class-properties'),
            ...plugins,
            require.resolve('@babel/plugin-transform-runtime')
        ],
        presets: [
            // https://babeljs.io/docs/en/babel-preset-react
            [require.resolve('@babel/preset-react'), { development: !isProduction }],
            /* https://babeljs.io/docs/en/babel-preset-env
            This compile the react code to be compatible to browsers with:
                - more than 0.25% market share
                - IOS safari >= 10
                - not dead (no more updates from 2 years ago)
                - no IE at all, no UCBrowser for android, no opera_mini at all
            see https://github.com/browserslist/browserslist for info

            For detailed browser list do from cmd:
            npx browserslist "> 0.25%, not dead, IOS >= 10, not ie >= 0, not and_uc >= 0, not op_mini all"
            */
            [require.resolve('@babel/preset-env'), { targets: '> 0.25%, not dead, IOS >= 10, not ie >= 0, not and_uc >= 0, not op_mini all' }]
        ]
    };
}
exports.babelConfig = babelConfig;
//# sourceMappingURL=babel.config.js.map