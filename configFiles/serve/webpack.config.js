const path = require('path');
const babelRcJs = require('./babel.config');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
/**
 * Webpack standard config. Some values may be changed at runtime (especially entry points and/or mode)
 * @param {*} context: the webpack context path
 */
module.exports = (context, config, packageJson) => {
    // NOTE: this is relative to the context path!
    const outputPath = './dist';

    return {
        mode: 'development',
        context: context,

        // see https://webpack.js.org/configuration/devtool/ for available devtools
        devtool: 'source-map',

        // babel files loader
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [{
                        loader: require.resolve('style-loader'),
                        options: { injectType: 'singletonStyleTag' }
                    },
                    {
                        loader: require.resolve('css-loader')
                    }]
                },
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        {
                            loader: require.resolve('file-loader'),
                            options: {
                                name: '[path][name].min.css'
                            }
                        },
                        require.resolve('sass-loader')
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

        // do not split chunks as now. Shared libs are managed with externals, and entry points will be packed as single files
        // Maybe in future this will be reviewed but as now use this config
        optimization: {
            splitChunks: {
                chunks: 'all'
            }
        },

        //
        entry: config.entryPoints || {},

        // resolves will be populated dynamically from project dependency files (onitbuild.config.json's)
        resolve: {

        },

        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: path.join(context, './assets'),
                        to: path.join(context, outputPath, './assets'),
                        noErrorOnMissing: true // some components may not have the assets folder. Don't throw errors on these ones.
                    }
                ],
                options: {
                    concurrency: 100
                }
            }),
            ...Object.keys(config.entryPoints).map(entryPoint => {
                // the output filename is just the input filename without the directory slashes.
                // this will make a file in the dist directory directly having a name which will remember us his origin location
                let filename = entryPoint.replace(new RegExp('\\' + path.sep, 'g'), '_');
                filename = filename.replace(new RegExp('/', 'g'), '_');

                let packagePublishPath = ((packageJson.mitown || {}).mountPath || packageJson.name.replace('@mitech/', ''));
                if (!packagePublishPath.startsWith('/')) packagePublishPath = '/' + packagePublishPath;
                return new HtmlWebpackPlugin({
                    template: path.join(__dirname, 'chunksTemplate.htmlWebpackPlugin.ejs'),
                    filename: filename + '.chunks.ejs',
                    // this will make the public path by package: dist/mitown, dist/mit-ask etc...
                    publicPath: '/dist' + packagePublishPath,
                    // don't add chunks for the entry points. These are loaded one by one manually by their pages
                    chunks: [entryPoint]
                });
            })
        ],

        // see https://webpack.js.org/configuration/output/
        output: {
            path: path.join(context, outputPath),
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
            swal2b: 'Swal2b',
            lodash: '_',
            toastr: 'toastr'
        },

        // see https://webpack.js.org/configuration/stats/#stats-presets
        stats: 'verbose'
    };
};
