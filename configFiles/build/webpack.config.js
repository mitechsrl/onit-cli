const babelRcJs = require('./babel.config');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

/**
 * Webpack standard config. Some values may be changed at runtime (especially entry points and/or mode)
 */
 
module.exports = {
    mode: 'production',
    context: process.cwd(),
    
    watch: false,

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
                test: /\.jsx$/,
                use: {
                    loader: require.resolve('babel-loader'),
                    options: babelRcJs
                }
            }
        ]
    },

    // do not slit chunks as now. Shared libs are managed with externals, and entry points will be packed as single files
    // Maybe in future this will be reviewed but as now use this config
    optimization: {
        splitChunks: false
    },

    resolve: {
    },

    plugins: [
        //new UnminifiedWebpackPlugin()
    ],

    // add previosly found entry point
    output: {
        path: process.cwd(),
        filename: '[name].min.js', 
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

    stats:'normal' //normal on build

};
