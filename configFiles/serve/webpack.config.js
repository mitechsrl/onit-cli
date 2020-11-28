const path = require('path');
const babelRcJs = require('./babel.config');
// const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const strip = require('strip-comments');
const fs = require('fs');

// some static config options
const serveBaseConfig = JSON.parse(strip(fs.readFileSync(path.join(__dirname, './options.jsonc')).toString()));

/**
 * Webpack serve config factory.
 * Some values may be changed at runtime (especially entry points and/or mode)
 *
 * @param {*} context: the webpack context path
 * @param {*} config
 * @param {*} packageJson the package.json content (js object) of the project to be webpacke'd.
 */
module.exports = (context, config, packageJson) => {
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
        resolve: {},

        // https://webpack.js.org/plugins/
        plugins: [

            // these plugin instances will create an html file(for chunck dependency inclusion) for each entry point
            ...Object.keys(config.entryPoints).map(entryPoint => {
                // the output filename is just the input filename without the directory slashes.
                // this will make a file in the dist directory directly having a name which will remember us his origin location
                let filename = entryPoint.replace(new RegExp('\\' + path.sep, 'g'), '_');
                filename = filename.replace(new RegExp('/', 'g'), '_');

                // this packagePublishPathValue must match the one from the package (whic is calculated wit the same logic)
                let packagePublishPath = ((packageJson.mitown || {}).mountPath || packageJson.name.replace('@mitech/', ''));
                if (!packagePublishPath.startsWith('/')) packagePublishPath = '/' + packagePublishPath;

                // create a plugin instance
                // see https://github.com/jantimon/html-webpack-plugin#options
                return new HtmlWebpackPlugin({
                    template: path.join(__dirname, '../common/chunksTemplate.htmlWebpackPlugin.ejs'),
                    filename: filename + '.chunks.ejs',
                    // this will make the public path by package: dist/mitown, dist/mit-ask etc...
                    publicPath: '/dist' + packagePublishPath,
                    // this particular instance will add (js chunk files) dependencies for this entrypoint
                    chunks: [entryPoint]
                });
            })
        ],

        // where to put final stuff.
        // see https://webpack.js.org/configuration/output/
        output: {
            path: path.join(context, serveBaseConfig.outputPath),
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
