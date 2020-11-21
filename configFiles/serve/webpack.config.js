const babelRcJs = require('./babel.config');


/**
 * Webpack standard config. Some values may be changed at runtime (especially entry points and/or mode)
 */
 
module.exports = {
    mode: 'development',
    context: process.cwd(),

    // see https://webpack.js.org/configuration/devtool/ for available devtools
    devtool:'source-map',
    
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
                test: /\.sass$/,
                use: [
                    {
                        loader: require.resolve('file-loader'),
                        options: { name: '[path][name].css'}
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

    // see https://webpack.js.org/configuration/output/
    output: {
        path: process.cwd(),
        filename: '[name].js', //or '[name].min.js'
    },

    // these libs are loaded manually in the browser (some of them are standard, some others are custom made)
    externals:{
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
    stats:'verbose'

};
