## Linting and Type Checking

IFRC GO Web App repository utilizes [ESLint](https://eslint.org/) and [Stylelint](https://stylelint.io/) for linting and formatting the code, as well as TypeScript for type checking.

### ESLint

Configuration for ESLint can be found in the [eslint.config.js](../app/eslint.config.js) file.

To lint your code

```bash
pnpm lint:js
```

To automatically fix fixable errors

```bash
pnpm lint:js --fix
```

### Stylelint

Configuration for Stylelint is located in the [stylelint.config.cjs](../app/stylelint.config.cjs) file.

To lint your CSS files

```bash
pnpm lint:css
```

To automatically fix fixable errors

```bash
pnpm lint:css --fix
```

### Fixing Lint Errors

To fix auto-fixable errors in both ESLint and Stylelint

```bash
pnpm lint:fix
```

### Type Checking

> \[!IMPORTANT]\
> Before running the type check, make sure to generate the types.
> To do this, define the API endpoints in the environment variables first.

To generate the TypeScript types for API endpoints

```bash
pnpm generate:type
```

To verify and enforce TypeScript type constraints

```bash
pnpm typecheck
```

### Knip

Find unused files, dependencies, and exports

```bash
pnpm lint:unused
```

Automatically fix issues detected by Knip

```bash
pnpm lint:unused --fix
```
