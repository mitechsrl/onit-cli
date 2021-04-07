const path = require('path');
const babelRcJs = require('./babel.config');
// const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const strip = require('strip-comments');
const fs = require('fs');
const ProgressPlugin = require('webpack').ProgressPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

// some static config options
const baseConfig = JSON.parse(strip(fs.readFileSync(path.join(__dirname, './options.jsonc')).toString()));

/**
 * Webpack serve config factory.
 * Some values may be changed at runtime (especially entry points and/or mode)
 *
 * @param {*} context: the webpack context path
 * @param {*} config
 * @param {*} packageJson the package.json content (js object) of the project to be webpacke'd.
 */
module.exports = (logger, context, config, packageJson) => {
    const componentName = path.basename(context);

    // this packagePublishPathValue must match the one from the package (whic is calculated wit the same logic)
    let packagePublishPath = packageJson.mountPath || (packageJson.mitown || {}).mountPath || packageJson.name.replace('@mitech/', '');
    if (!packagePublishPath.startsWith('/')) packagePublishPath = '/' + packagePublishPath;

    let _debounceMessage = '';
    const progressHandler = (percentage, message, ...args) => {
        // console.log('[WEBPACK] ' + componentName + ' ' + percentage);
        if ((percentage < 0.99) && (message !== _debounceMessage)) {
            const p = (percentage * 100).toFixed(0);
            _debounceMessage = message;
            logger.warn('[WEBPACK] ' + componentName + ' build ' + p + '% ' + message);
        }
    };
    return {
        mode: 'development',
        context: context,

        /* this sometimes crashes node??
        cache: {
            type: 'filesystem',
            store: 'pack',
            idleTimeout: 10000,
            idleTimeoutForInitialStore: 30000
        }, */

        // see https://webpack.js.org/configuration/devtool/ for available devtools
        devtool: 'source-map',

        // babel files loader
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        require.resolve('css-loader')
                    ]
                    /* use: [{
                        loader: require.resolve('style-loader'),
                        options: { injectType: 'singletonStyleTag' }
                    },
                    {
                        loader: require.resolve('css-loader')
                    }
                    ] */
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
            new CaseSensitivePathsPlugin(),

            new FriendlyErrorsWebpackPlugin({
                clearConsole: false
            }),

            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false
            }),

            new ProgressPlugin({
                handler: progressHandler
            }),

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
            swal2b: 'Swal2b', // FIXME: 07-04-2021 qui per retrocompatibilità. Rimuovere
            lodash: '_',
            toastr: 'toastr', // FIXME: 07-04-2021 qui per retrocompatibilità. Rimuovere
            jquery: 'jQuery'
        },

        // see https://webpack.js.org/configuration/stats/#stats-presets
        stats: 'verbose'
    };
};
