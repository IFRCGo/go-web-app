import fs from 'fs';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const uiCssPath = path.resolve(__dirname, './node_modules/@ifrc-go/ui/dist/index.css');
const uiCssExists = fs.existsSync(uiCssPath);

const cssPaths = [
    path.resolve(__dirname, './src/index.css'),
    ...(uiCssExists ? [uiCssPath] : []),
    path.resolve(__dirname, './src/components/NrwMap/MapboxDataMap/styles.module.css'),
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
        // Disable when @ifrc-go/ui is not built, since most custom properties
        // come from that package. The full CI pipeline (which builds the UI
        // package first) will still validate these.
        'csstools/value-no-unknown-custom-properties': uiCssExists
            ? [true, { importFrom: cssPaths }]
            : null,
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
    },
};

export default config;
