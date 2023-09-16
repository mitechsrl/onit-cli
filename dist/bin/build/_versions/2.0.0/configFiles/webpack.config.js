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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackConfigFactory = void 0;
const path_1 = __importDefault(require("path"));
const mixinFromFile_1 = require("../lib/mixinFromFile");
const progressHandler_1 = require("../lib/progressHandler");
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const css_minimizer_webpack_plugin_1 = __importDefault(require("css-minimizer-webpack-plugin"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const case_sensitive_paths_webpack_plugin_1 = __importDefault(require("case-sensitive-paths-webpack-plugin"));
const clean_webpack_plugin_1 = require("clean-webpack-plugin");
const webpack_1 = require("webpack");
const babel_config_1 = require("./babel.config");
const webpack_subresource_integrity_1 = require("webpack-subresource-integrity");
// No tpescript for this package.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
/**
 *
 * @param {*} context the webpack context path
 * @param {*} config
 * @param {*} packageJson the package.json content (js object) of the project to be webpacke'd.
 */
async function webpackConfigFactory(context, config, packageJson) {
    const env = 'production';
    const componentName = path_1.default.basename(context);
    // this packagePublishPathValue must match the one from the package (whic is calculated wit the same logic)
    let packagePublishPath = packageJson.name.split('/').pop();
    if (!packagePublishPath.startsWith('/'))
        packagePublishPath = '/' + packagePublishPath;
    let _config = {
        mode: env,
        context: context,
        // see https://webpack.js.org/configuration/devtool/ for available devtools
        devtool: 'source-map',
        // babel files loader
        module: {
            rules: [
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false
                    }
                },
                // https://webpack.js.org/loaders/css-loader/
                // https://webpack.js.org/plugins/mini-css-extract-plugin/
                {
                    // pack css as standalone files
                    test: /\.css$/i,
                    use: [
                        mini_css_extract_plugin_1.default.loader,
                        require.resolve('css-loader')
                    ]
                },
                // see https://webpack.js.org/loaders/sass-loader/
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        mini_css_extract_plugin_1.default.loader,
                        {
                            loader: require.resolve('css-loader'),
                            options: { url: false }
                        },
                        {
                            loader: require.resolve('sass-loader'),
                            options: {
                                implementation: require('sass')
                            }
                        }
                    ]
                },
                // https://webpack.js.org/loaders/babel-loader/
                {
                    test: /\.jsx$/,
                    use: {
                        loader: require.resolve('babel-loader'),
                        options: (0, babel_config_1.babelConfig)(env)
                    }
                },
                // https://webpack.js.org/loaders/file-loader/
                {
                    test: /\.(svg|png|jpe?g|gif)$/i,
                    use: [
                        {
                            loader: require.resolve('file-loader'),
                            options: {
                                // temporary fix for leaflet png imports, see https://github.com/PaulLeCam/react-leaflet/issues/255
                                name: 'img/[name]_[hash:7].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        // this will create shared modules between pages.
        // https://webpack.js.org/plugins/split-chunks-plugin/#splitchunkschunks
        optimization: {
            realContentHash: true,
            minimize: env === 'production',
            splitChunks: {
                // was all, but started having issues.
                // Can't find why.
                // Info: https://github.com/jantimon/html-webpack-plugin/issues/1366
                chunks: 'async'
            },
            minimizer: [
                // minimize css: https://github.com/webpack-contrib/css-minimizer-webpack-plugin
                new css_minimizer_webpack_plugin_1.default(),
                // minimize js: https://webpack.js.org/plugins/terser-webpack-plugin/
                new terser_webpack_plugin_1.default()
            ]
        },
        // The list of entry points is calculated dynamically before starting the webpack process
        entry: config.entryPoints || {},
        // resolves will be populated dynamically from project dependency files (onitbuild.config.json's)
        resolve: {
            // https://webpack.js.org/configuration/resolve/#resolveextensions
            extensions: ['.wasm', '.mjs', '.js', '.jsx', '.json']
        },
        // https://webpack.js.org/plugins/
        plugins: [
            // force case sensitive to be correct (thanks windows)
            // https://www.npmjs.com/package/case-sensitive-paths-webpack-plugin
            new case_sensitive_paths_webpack_plugin_1.default(),
            // show human readable errors
            // https://github.com/geowarin/friendly-errors-webpack-plugin#readme
            new FriendlyErrorsWebpackPlugin({
                clearConsole: false
            }),
            // delete old webpack stuff on start
            new clean_webpack_plugin_1.CleanWebpackPlugin({
                cleanStaleWebpackAssets: false
            }),
            // show a compilation progress info
            new webpack_1.ProgressPlugin({
                handler: (0, progressHandler_1.progressHandler)(componentName)
            }),
            // separate css from js files
            // https://webpack.js.org/plugins/mini-css-extract-plugin/
            new mini_css_extract_plugin_1.default({
                filename: '[contenthash].min.css' // use [contenthash] on prod build
            }),
            // these plugin instances will create an html file(for chunck dependency inclusion) for each entry point
            ...Object.keys(config.entryPoints).map(entryPoint => {
                // create a plugin instance
                // see https://github.com/jantimon/html-webpack-plugin#options
                return new html_webpack_plugin_1.default({
                    // we need just the list of tags. Position in the page is managed by onit render
                    templateContent: ({ htmlWebpackPlugin }) => `
                        ${htmlWebpackPlugin.tags.headTags}
                        ${htmlWebpackPlugin.tags.bodyTags}
                    `,
                    inject: false,
                    // the output filename is just the entry point. Make sure you have unique identified entry points
                    filename: entryPoint.toLowerCase() + '.chunks.ejs',
                    // this will make the public path by package: dist/onit-next, dist/onit-ui etc...
                    publicPath: '/dist-fe' + packagePublishPath,
                    // this particular instance will add (js chunk files) dependencies for this entrypoint
                    chunks: [entryPoint]
                });
            }),
            // Enable SRI for compiled files
            // https://github.com/waysact/webpack-subresource-integrity
            new webpack_subresource_integrity_1.SubresourceIntegrityPlugin({
                hashFuncNames: ['sha256', 'sha384'],
                enabled: env === 'production'
            })
        ],
        // where to put final stuff.
        // see https://webpack.js.org/configuration/output/
        output: {
            path: path_1.default.join(context, config.buildPath),
            filename: '[contenthash].js',
            crossOriginLoading: 'anonymous' // needed for SubresourceIntegrityPlugin
        },
        // https://webpack.js.org/configuration/performance/
        performance: {
            // https://webpack.js.org/configuration/performance/#performancemaxentrypointsize
            maxEntrypointSize: 768000,
            // https://webpack.js.org/configuration/performance/#performancemaxassetsize
            maxAssetSize: 768000
        },
        // these libs are loaded manually in the browser (some of them are standard, some others are custom made)
        externals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            moment: 'moment',
            'prop-types': 'PropTypes',
            utility: 'utility',
            d3: 'd3',
            lodash: '_',
            jquery: 'jQuery'
        },
        // see https://webpack.js.org/configuration/stats/#stats-presets
        stats: 'verbose'
    };
    // merge this default config with the one from the current project directory.
    // the merge is skipped if no config can be found.
    // The file must export a function accepting one parameter, the default config, and return a new configuration:
    // (conf) => { conf.myOptions = 1; return conf;}
    _config = (0, mixinFromFile_1.mixinFromFile)(_config, path_1.default.resolve(process.cwd(), './webpack.config.js'));
    return _config;
}
exports.webpackConfigFactory = webpackConfigFactory;
//# sourceMappingURL=webpack.config.js.map