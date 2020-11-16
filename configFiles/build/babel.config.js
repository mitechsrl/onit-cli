
module.exports = {
    env: {
        production: {
            plugins: [
                [
                    // https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types
                    require.resolve('babel-plugin-transform-react-remove-prop-types'),
                    {
                        removeImport: true
                    }
                ]
            ]
        }
    },
    plugins: [
        require.resolve('@babel/plugin-proposal-class-properties')
    ],
    presets: [
        require.resolve('@babel/preset-react')
    ]
};
