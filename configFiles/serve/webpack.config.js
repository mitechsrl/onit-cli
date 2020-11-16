const babelRcJs = require('./babel.config');


/**
 * Webpack standard config. Some values may be changed at runtime (especially entry points and/or mode)
 */
 
module.exports = {
    mode: 'development',
    context: process.cwd(),

    // babel files loader
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [{
                    loader: 'style-loader',
                    options: { injectType: 'singletonStyleTag' }
                },
                {
                    loader: 'css-loader'
                }]
            },
            {
                test: /\.jsx$/,
                use: {
                    loader: 'babel-loader',
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

    // add previosly found entry point
    output: {
        path: process.cwd(),
        filename: '[name].js', //config.live ? '[name].js' : '[name].min.js'
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

    stats:'errors-only' //normal on build

};
