const config = {
    env: {
        node: true,
        browser: true,
        es2020: true,
    },
    root: true,
    extends: [
        'airbnb',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic',
        'plugin:react-hooks/recommended',
        'plugin:storybook/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: [
            './tsconfig.json',
        ],
    },
    plugins: [
        '@typescript-eslint',
        'react-refresh',
        'simple-import-sort',
        'import-newlines',
    ],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                project: [
                    './tsconfig.json',
                ],
            },
        },
    },
    rules: {
        'react-refresh/only-export-components': 'warn',

        'no-unused-vars': 0,
        '@typescript-eslint/no-unused-vars': 1,

        'no-use-before-define': 0,
        '@typescript-eslint/no-use-before-define': 1,

        'no-shadow': 0,
        '@typescript-eslint/no-shadow': ['error'],

        'import/no-unresolved': ['error', { ignore: ['^virtual:'] }],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    '**/*.test.{ts,tsx}',
                    'eslint.config.js',
                    'postcss.config.cjs',
                    'stylelint.config.cjs',
                    'vite.config.ts',
                ],
                optionalDependencies: false,
            },
        ],

        indent: ['error', 4, { SwitchCase: 1 }],

        'import/no-cycle': ['error', { allowUnsafeDynamicCyclicDependency: true }],

        'react/react-in-jsx-scope': 'off',
        camelcase: 'off',

        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],

        'import/extensions': ['off', 'never'],

        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        'react/require-default-props': ['warn', { ignoreFunctionalComponents: true }],
        'simple-import-sort/imports': 'warn',
        'simple-import-sort/exports': 'warn',
        'import-newlines/enforce': ['warn', 1],
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                fixStyle: 'inline-type-imports',
            },
        ],
        '@typescript-eslint/consistent-type-exports': 'error'
    },
    overrides: [
        {
            files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
            rules: {
                'simple-import-sort/imports': [
                    'error',
                    {
                        groups: [
                            // side effect imports
                            ['^\\u0000'],
                            // packages `react` related packages come first
                            ['^react', '^@?\\w'],
                            // internal packages
                            ['^#.+$'],
                            // parent imports. Put `..` last
                            // other relative imports. Put same-folder imports and `.` last
                            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                            // style imports
                            ['^.+\\.json$', '^.+\\.module.css$'],
                        ],
                    },
                ],
            },
        },
    ],
};

module.exports = config;
