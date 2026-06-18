const config  = {
    plugins: [
        'stylelint-value-no-unknown-custom-properties',
    ],
    extends: [
        'stylelint-config-recommended',
        'stylelint-config-concentric',
    ],
    rules: {
        // https://stylelint.io/migration-guide/to-15
        // indentation: 4,
        'csstools/value-no-unknown-custom-properties': [
            true, {
                importFrom: ['./src/index.css']
            },
        ],
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
        // Design-token adherence gate: components must route colour through
        // the --go-ui-color-* tokens, never raw hex. index.css (the token
        // source of truth) is exempted in the override below.
        'color-no-hex': true,
        // Raw px is a token-bypass too; surfaced as a warning to ratchet to
        // error once the remaining offenders are tokenised (see GO_UI_AUDIT).
        'unit-disallowed-list': [
            ['px'],
            { severity: 'warning' },
        ],
    },
    overrides: [
        {
            // index.css defines the token scales, so raw hex/px values are
            // expected and allowed there.
            files: ['src/index.css'],
            rules: {
                'color-no-hex': null,
                'unit-disallowed-list': null,
            },
        },
    ],
};

export default config;
