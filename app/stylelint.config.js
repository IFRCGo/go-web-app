import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cssPaths = [
    path.resolve(__dirname, './src/index.css'),
    path.resolve(__dirname, './node_modules/@ifrc-go/ui/dist/index.css'),
];

/** @type {import('stylelint').Config} */
const config = {
    extends: [
        'stylelint-config-recommended',
        'stylelint-config-concentric',
    ],
    plugins: [
        'stylelint-value-no-unknown-custom-properties',
    ],
    rules: {
        'csstools/value-no-unknown-custom-properties': [
            true,
            {
                importFrom: cssPaths,
            },
        ],
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
    },
};

export default config;
