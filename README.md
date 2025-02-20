<p align="center">
  <br />
  <a href="https://go.ifrc.org/">
    <picture>
      <img src="https://github.com/IFRCGo/go-web-app/blob/develop/app/src/assets/icons/go-logo-2020.svg" width="200px" alt="IFRC GO Logo">
    </picture>
  </a>
</p>

# IFRC GO

[IFRC GO](https://go.ifrc.org/) is the platform of the International Federation of Red Cross and Red Crescent, aimed at connecting crucial information on emergency needs with the appropriate response. This repository houses the frontend source code for the application, developed using [React](https://react.dev/), [Vite](https://vitejs.dev/), and associated technologies.

## Built With

[![React][react-shields]][react-url] [![Vite][vite-shields]][vite-url] [![TypeScript][typescript-shields]][typescript-url] [![pnpm][pnpm-shields]][pnpm-url]

## Getting Started

Below are the steps to guide you through preparing your local environment for IFRC GO Web application development. The repository is set up as a [monorepo](https://monorepo.tools/). The [app](https://github.com/IFRCGo/go-web-app/tree/develop/app) directory houses the application code, while the [packages](https://github.com/IFRCGo/go-web-app/tree/develop/packages) directory contains related packages, including the [IFRC GO UI](https://www.npmjs.com/package/@ifrc-go/ui) components library.

### Prerequisites

To begin, ensure you have network access. Then, you'll need the following:

1. [Git](https://git-scm.com/)
2. [Node.js](https://nodejs.org/en/) as specified under `engines` section in `package.json` file
3. [pnpm](https://pnpm.io/) as specified under `engines` section in `package.json` file
4. Alternatively, you can use [Docker](https://www.docker.com/) to build the application.

> \[!NOTE]\
> Make sure the correct versions of pnpm and Node.js are installed. They are specified under `engines` section in `package.json` file.

### Local Development

1. Clone the repository using HTTPS, SSH, or GitHub CLI:

   ```bash
   git clone https://github.com/IFRCGo/go-web-app.git # HTTPS
   git clone git@github.com:IFRCGo/go-web-app.git # SSH
   gh repo clone IFRCGo/go-web-app # GitHub CLI
   ```

2. Install the dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the `app` directory and add variables from [env.ts](https://github.com/IFRCGo/go-web-app/blob/develop/app/env.ts). Any variables marked with `.optional()` are not mandatory for setup and can be skipped.

   ```bash
   cd app
   touch .env
   ```

   Example `.env` file
   ```
   APP_TITLE=IFRC GO
   APP_ENVIRONMENT=testing
   ...
   ```

4. Start the development server:

   ```bash
   pnpm start:app
   ```

## Contributing

* Check out existing [Issues](https://github.com/IFRCGo/go-web-app/issues) and [Pull Requests](https://github.com/IFRCGo/go-web-app/pulls) to contribute.
* To request a feature or report a bug, [create a GitHub Issue](https://github.com/IFRCGo/go-web-app/issues/new/choose).
* [Contribution Guide →](./CONTRIBUTING.md)
* [Collaboration Guide →](./COLLABORATING.md)

## Additional Packages

The repository hosts multiple packages under the `packages` directory.

1. [IFRC GO UI](https://github.com/IFRCGo/go-web-app/tree/develop/packages/ui) is a React UI components library tailored to meet the specific requirements of the IFRC GO community and its associated projects.
2. [IFRC GO UI Storybook](https://github.com/IFRCGo/go-web-app/tree/develop/packages/go-ui-storybook) serves as the comprehensive showcase for the IFRC GO UI components library. It is hosted on [Chromatic](https://66557be6b68dacbf0a96db23-zctxglhsnk.chromatic.com/).

## IFRC GO Backend

The backend that serves the frontend application is maintained in a separate [repository](https://github.com/IFRCGo/go-api/).

## Previous Repository

[Go Frontend](https://github.com/IFRCGo/go-frontend) is the previous version of the project which contains the original codebase and project history.

## Community & Support

* Visit the [IFRC GO Wiki](https://go-wiki.ifrc.org/) for documentation of the IFRC GO platform.
* Stay informed about the latest project updates on [Medium](https://ifrcgoproject.medium.com/).

## License

[MIT](https://github.com/IFRCGo/go-web-app/blob/develop/LICENSE)

<!-- MARKDOWN LINKS & IMAGES -->

[react-shields]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB

[react-url]: https://reactjs.org/

[vite-shields]: https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white

[vite-url]: https://vitejs.dev/

[typescript-shields]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white

[typescript-url]: https://www.typescriptlang.org/

[pnpm-shields]: https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=fff

[pnpm-url]: https://pnpm.io/
