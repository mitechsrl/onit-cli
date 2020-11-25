
module.exports = {
    cacheDirectory: true,
    cacheCompression: false,
    plugins: [
        require.resolve('@babel/plugin-proposal-class-properties')
    ],
    presets: [
        require.resolve('@babel/preset-react')
    ]
};
