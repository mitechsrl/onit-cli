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

import { GenericObject } from '../../../../../types';
import path from 'path';
import { mixinFromFile } from '../../../../build/versions/2.0.0/lib/mixinFromFile';
import { progressHandler } from '../../../../build/versions/2.0.0/lib/progressHandler';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { ProgressPlugin } from 'webpack';
import { babelConfig } from '../../../../build/versions/2.0.0/configFiles/babel.config';

// No tpescript for this package.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

/**
 * Webpack serve config factory.
 * Some values may be changed at runtime (especially entry points and/or mode)
 *
 * @param {*} context: the webpack context path
 * @param {*} config
 * @param {*} packageJson the package.json content (js object) of the project to be webpacke'd.
 */
export async function webpackConfigFactory (context:string, config: GenericObject, packageJson: GenericObject) {
    const env = config.production ? 'production' : 'development';
    const componentName = path.basename(context);

    const minimize = config.minimize;

    // this packagePublishPathValue must match the one from the package (whic is calculated wit the same logic)
    let packagePublishPath = packageJson.name.split('/').pop();
    if (!packagePublishPath.startsWith('/')) packagePublishPath = '/' + packagePublishPath;

    let _config = {
        mode: env,
        context: context,

        // see https://webpack.js.org/configuration/devtool/ for available devtools
        devtool: 'source-map', // prodution: source-map

        // babel files loader
        module: {
            rules: [
                {
                    test: /\.m?js/,
                    // enforce: 'pre',
                    // https://webpack.js.org/loaders/source-map-loader/
                    // this extract the source-maps from included files and add it to the current build
                    // On dev, this is extremely useful since we can eventually debug our own packages
                    /*
                    use: [{
                        loader: require.resolve('source-map-loader'),
                        options: {}
                    }],
                    */
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
                        MiniCssExtractPlugin.loader,
                        require.resolve('css-loader')
                    ]
                },

                // see https://webpack.js.org/loaders/sass-loader/
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
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
                        options: babelConfig(env)
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
        optimization: Object.assign(
            {
                splitChunks: {
                    // was all, but started having issues.
                    // Can't find why.
                    // Info: https://github.com/jantimon/html-webpack-plugin/issues/1366
                    chunks: 'async'
                }
            },

            minimize
                ? {
                    minimize: true,
                    minimizer: [
                        // minimize css: https://github.com/webpack-contrib/css-minimizer-webpack-plugin
                        new CssMinimizerPlugin(),
                        // minimize js: https://webpack.js.org/plugins/terser-webpack-plugin/
                        new TerserPlugin()
                    ]
                }
                : {}
        ),

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
            new CaseSensitivePathsPlugin(),

            // show human readable errors
            new FriendlyErrorsWebpackPlugin({
                clearConsole: false
            }),

            // delete old webpack stuff on start
            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false
            }),

            // show a compilation progress info
            new ProgressPlugin({
                handler: progressHandler(componentName)
            }),

            // separate css from js files
            // https://webpack.js.org/plugins/mini-css-extract-plugin/
            new MiniCssExtractPlugin({
                filename: '[contenthash].min.css' // use [contenthash] on prod build
            }),

            // these plugin instances will create an html file(for chunck dependency inclusion) for each entry point
            ...Object.keys(config.entryPoints).map(entryPoint => {
                // create a plugin instance
                // see https://github.com/jantimon/html-webpack-plugin#options
                return new HtmlWebpackPlugin({
                    // we need just the list of tags. Position in the page is managed by onit render
                    templateContent: (cfg: GenericObject) => `
                        ${cfg.htmlWebpackPlugin.tags.headTags}
                        ${cfg.htmlWebpackPlugin.tags.bodyTags}
                    `,
                    inject: false, // do not add other tags than the ones from templateContent
                    // the output filename is just the entry point. Make sure you have unique identified entry points
                    filename: entryPoint.toLowerCase() + '.chunks.ejs',
                    // this will make the public path by package: dist/mitown, dist/mit-ask etc...
                    publicPath: '/dist-fe' + packagePublishPath,
                    // this particular instance will add (js chunk files) dependencies for this entrypoint
                    chunks: [entryPoint]
                });
            })
        ],

        // where to put final stuff.
        // see https://webpack.js.org/configuration/output/
        output: {
            path: path.join(context, config.outputPath),
            filename: '[contenthash].js'
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
    _config = mixinFromFile(_config, path.resolve(process.cwd(), './webpack.config.js'));
    return _config;
}
