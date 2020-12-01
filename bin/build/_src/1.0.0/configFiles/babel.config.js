
module.exports = {
    plugins: [
        require.resolve('@babel/plugin-proposal-class-properties'),
        [
            // https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types
            require.resolve('babel-plugin-transform-react-remove-prop-types'),
            {
                removeImport: true
            }
        ]
    ],
    presets: [
        require.resolve('@babel/preset-react')
    ]
};
