import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
    baseDirectory: dirname,
    resolvePluginsRelativeTo: dirname,
});

const appConfigs = compat.config({
    env: {
        browser: true,
        es2020: true,
    },
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
    ],
    settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx']
        },
        'import/resolver': {
          typescript: {
            project: './tsconfig.json',
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

        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],

        'import/extensions': ['off', 'never'],

        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        'react/require-default-props': ['warn', { ignoreFunctionalComponents: true }],
    },
}).map((conf) => ({
    ...conf,
    files: ['src/**/*.tsx', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.js'],
}));

const otherConfig = {
    files: ['*.js', '*.ts', '*.cjs'],
    ...js.configs.recommended,
};

export default [
    ...appConfigs,
    otherConfig,
];
