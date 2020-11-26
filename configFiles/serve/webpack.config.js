const path = require('path');
const babelRcJs = require('./babel.config');
const CopyPlugin = require('copy-webpack-plugin');

/**
 * Webpack standard config. Some values may be changed at runtime (especially entry points and/or mode)
 * @param {*} context: the webpack context path
 */
module.exports = (context) => {
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
                }
            ]
        },

        // do not split chunks as now. Shared libs are managed with externals, and entry points will be packed as single files
        // Maybe in future this will be reviewed but as now use this config
        optimization: {
            splitChunks: false
        },

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
            })
        ],

        // see https://webpack.js.org/configuration/output/
        output: {
            path: path.join(context, outputPath),
            filename: '[name].js' // or '[name].min.js'
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
