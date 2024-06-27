import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import process from 'process';

const dirname = process.cwd();

const compat = new FlatCompat({
    baseDirectory: dirname,
    resolvePluginsRelativeTo: dirname,
});

const appConfigs = compat.config({
    env: {
        node: true,
        browser: true,
        es2020: true,
    },
    root: true,
    extends: [
        'airbnb',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'react-refresh',
        'simple-import-sort',
        'import-newlines'
    ],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx']
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
        'camelcase': 'off',

        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],

        'import/extensions': ['off', 'never'],

        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        'react/require-default-props': ['warn', { ignoreFunctionalComponents: true }],
        'simple-import-sort/imports': 'warn',
        'simple-import-sort/exports': 'warn',
        'import-newlines/enforce': ['warn', 1]
    },
    overrides: [
        {
            files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
            rules: {
                'simple-import-sort/imports': [
                    'error',
                    {
                        'groups': [
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
                        ]
                    }
                ]
            }
        }
    ]
}).map((conf) => ({
    ...conf,
    files: ['src/**/*.tsx', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.js'],
    ignores: ['src/generated/types.ts'],
}));

const otherConfig = {
    files: ['*.js', '*.ts', '*.cjs'],
    ...js.configs.recommended,
};

export default [
    ...appConfigs,
    otherConfig,
];
