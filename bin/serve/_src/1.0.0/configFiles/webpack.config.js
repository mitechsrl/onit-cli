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

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressPlugin = require('webpack').ProgressPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const progressHandler = require('../../../../../lib/webpack/progressHandler');
const baseConfig = require('../../../../../shared/1.0.0/configFiles/options');
const babelConfig = require('../../../../../shared/1.0.0/configFiles/babel.config');
const mixinFromFile = require('../../../../../lib/webpack/mixinFromFile');

/**
 * Webpack serve config factory.
 * Some values may be changed at runtime (especially entry points and/or mode)
 *
 * @param {*} context: the webpack context path
 * @param {*} config
 * @param {*} packageJson the package.json content (js object) of the project to be webpacke'd.
 */
module.exports = (context, config, packageJson) => {
    const env = 'development';
    const componentName = path.basename(context);

    // this packagePublishPathValue must match the one from the package (whic is calculated wit the same logic)
    let packagePublishPath = packageJson.mountPath || (packageJson.mitown || {}).mountPath || packageJson.name.replace('@mitech/', '');
    if (!packagePublishPath.startsWith('/')) packagePublishPath = '/' + packagePublishPath;

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
                    test: /\.(png|jpe?g|gif)$/i,
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
            splitChunks: {
                chunks: 'all'
            }
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
                // the output filename is just the input filename without the directory slashes.
                // this will make a file in the dist directory directly having a name which will remember us his origin location
                let filename = entryPoint;
                while (filename.indexOf(path.sep) >= 0) {
                    filename = filename.replace(path.sep, '_');
                }

                // create a plugin instance
                // see https://github.com/jantimon/html-webpack-plugin#options
                return new HtmlWebpackPlugin({
                    // we need just the list of tags. Position in the page is managed by onit render
                    templateContent: ({ htmlWebpackPlugin }) => `
                        ${htmlWebpackPlugin.tags.headTags}
                        ${htmlWebpackPlugin.tags.bodyTags}
                    `,
                    inject: false, // do not add other tags than the ones from templateContent
                    filename: filename + '.chunks.ejs',
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
            path: path.join(context, baseConfig.outputPath),
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
            swal2b: 'Swal2b', // FIXME: 07-04-2021 qui per retrocompatibilità. Rimuovere in futuro
            lodash: '_',
            toastr: 'toastr', // FIXME: 07-04-2021 qui per retrocompatibilità. Rimuovere in futuro
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
};
