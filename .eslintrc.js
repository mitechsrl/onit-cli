module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    env: {
        node: true,
        es6: true
    },

    ignorePatterns: [
        'node_modules'
    ],

    parserOptions: {
        ecmaVersion: 2018
    },

    rules: {
        // always ask for line semi. It make clear where the line ends.
        '@typescript-eslint/semi': ['error', 'always'],
        // We request string with single quotes
        '@typescript-eslint/quotes': ['error', 'single'],
        // This uniform the spacing in curly
        '@typescript-eslint/object-curly-spacing': ['error', 'always'],
        // for better code readability, the indent is set to 4. Default 2 is too thin and sometines create confusion
        // NOTE: BROKEN on ESLINT 8!
        // see https://github.com/eslint/eslint/issues/15299#issuecomment-967762181
        // see https://github.com/eslint/eslint/issues/15299#issuecomment-968099681
        '@typescript-eslint/indent': ['error', 4, { 'ignoredNodes': ['PropertyDefinition'] }],
        // To avoid having 'sparse code', the amount of spaces is limited
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
        'no-multi-spaces': ['error', { ignoreEOLComments: true }],
        // Cmplain about empty constructors
        'no-useless-constructor': 'off',
        // These are our naming convension rules.
        // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md
        '@typescript-eslint/naming-convention': ['error',
            {
                selector: [
                    'objectLiteralProperty',
                ],
                format: null,
                modifiers: ['requiresQuotes']
            },
            {
                selector: ['memberLike', 'variableLike', 'typeLike'],
                format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                leadingUnderscore: 'allowSingleOrDouble'
            }
        ],
        // to me, is somehow more clear {prop:prop}
        'object-shorthand': ['error', 'never']
    }

};
