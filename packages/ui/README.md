## IFRC GO UI

[![npm (scoped)](https://img.shields.io/npm/v/@ifrc-go/ui)](https://github.com/IFRCGo/go-web-app/blob/develop/LICENSE)
[![npm (scoped)](https://img.shields.io/npm/l/@ifrc-go/ui)](https://github.com/IFRCGo/go-web-app/blob/develop/LICENSE)
[![Build](https://github.com/IFRCGo/go-web-app/actions/workflows/ci.yml/badge.svg)](https://github.com/IFRCGo/go-web-app/actions/workflows/ci.yml)

[IFRC GO UI](https://www.npmjs.com/package/@ifrc-go/ui) is a React components library for the IFRC GO platform and its associated initiatives.

## Built with

[![React][react-shields]][react-url] [![Vite][vite-shields]][vite-url] [![Typescript][typescript-shields]][typescript-url]

## Installation

Install the `@ifrc-go/ui` package and its peer dependencies.

```bash
# using pnpm
pnpm install @ifrc-go/ui
# using npm
npm install @ifrc-go/ui
```

## Usage

```tsx
import { Button } from '@ifrc-go/ui';

function Example() {
    const handleButtonClick = () => {
        console.warn('button clicked');
    };

    return (
        <Button
            name="button"
            onClick={handleButtonClick}
            variant="tertiary"
        >
            Button
        </Button>
    );
}
```

## Changelog

The [changelog](https://github.com/IFRCGo/go-web-app/blob/develop/packages/ui/CHANGELOG.md) file summarizes the changes made to the library across different releases. The changelog is regularly updated to reflect what's changed in each new release.

## Contributing

[See contribution guide →](https://github.com/IFRCGo/go-web-app/tree/develop/packages/ui/CONTRIBUTING.md)

## License

[MIT](https://github.com/IFRCGo/go-web-app/blob/develop/LICENSE)

<!-- MARKDOWN LINKS & IMAGES -->

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[react-shields]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB

[react-url]: https://reactjs.org/

[vite-shields]: https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white

[vite-url]: https://vitejs.dev/

[typescript-shields]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white

[typescript-url]: https://www.typescriptlang.org/
