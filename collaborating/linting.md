## Linting

The app repository runs [ESLint](https://eslint.org/), [Stylelint](https://stylelint.io/) to lint and format the code.

## ESLint
The configuration is defined in [eslint.config.js](../app/eslint.config.js) file.
To lint the code, you can use the following command:
```bash
yarn lint:js
```
If you encounter errors, you can automatically fix those that are fixable by running:
```bash
yarn lint:js --fix
```

## Stylelint
The configuration is defined in [stylelint.config.cjs](../app/stylelint.config.cjs) file.
To lint CSS files, use the following command:
```bash
yarn lint:css
```
If any errors are found, you can automatically fix those that are fixable by running:
```bash
yarn lint:css --fix
```

To fix auto fixable `ESLint` and `Stylelint` errors, run the following command:
```bash
yarn lint:fix
```

## Type Checking
To verify and enforce TypeScript type constraints in your code, use the following command:
```bash
yarn typecheck
```

## Lint Translation files
To check for translation file errors:
```bash
yarn lint:translation
```
