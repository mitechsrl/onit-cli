module.exports = {
    ignorePatterns: [
        'node_modules'
    ],
    env: {
        node: true,
        es6: true
    },
    extends: [
        'standard',
        'plugin:node/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        semi: ['error', 'always'],
        indent: ['error', 4],
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }]
    }
};
