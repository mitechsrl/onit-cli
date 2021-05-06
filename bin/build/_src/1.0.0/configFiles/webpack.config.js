const path = require('path');
const babelRcJs = require('./babel.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const strip = require('strip-comments');
const fs = require('fs');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

// some static config options
const baseConfig = JSON.parse(strip(fs.readFileSync(path.join(__dirname, './options.jsonc')).toString()));

/**
 * Webpack build config factory.
 * Some values may be changed at runtime (especially entry points and/or mode)
 *
 * @param {*} context: the webpack context path
 * @param {*} config
 * @param {*} packageJson the package.json content (js object) of the project to be webpacke'd.
 */
module.exports = (context, config, packageJson) => {
    // this packagePublishPathValue must match the one from the package (whic is calculated wit the same logic)
    let packagePublishPath = packageJson.mountPath || (packageJson.mitown || {}).mountPath || packageJson.name.replace('@mitech/', '');
    if (!packagePublishPath.startsWith('/')) packagePublishPath = '/' + packagePublishPath;

    return {
        mode: 'production',
        context: context,
        watch: false,

        // see https://webpack.js.org/configuration/devtool/ for available devtools
        // add source maps also on production mode so we can debug a production-deployed page with more accuracy if needed
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
                {
                    test: /\.jsx$/,
                    use: {
                        loader: require.resolve('babel-loader'),
                        options: babelRcJs
                    }
                },
                {
                    test: /\.htmlWebpackPlugin\.ejs$/,
                    loader: require.resolve('raw-loader')
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

            // force case sensitive to be correct (thinking of windows in detail)
            new CaseSensitivePathsPlugin(),

            // show human readable errors
            new FriendlyErrorsWebpackPlugin({
                clearConsole: false
            }),

            // show a progress bar in console while building
            // https://github.com/clessg/progress-bar-webpack-plugin#readme
            new ProgressBarPlugin(),

            new MiniCssExtractPlugin({
                filename: '[contenthash].min.css'
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
                    template: path.join(__dirname, '../../../../../configFiles/common/chunksTemplate.htmlWebpackPlugin.ejs'),
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
            path: path.join(context, config.buildPath, baseConfig.outputPath),
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
};
