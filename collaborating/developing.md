## Development

The stable branch for the IFRC GO application is `develop`. All PRs intended for deployment should be merged into the `develop` branch.

### Prerequisites

To begin, ensure you have network access. Then, you'll need the following

1. [Git](https://git-scm.com/)
2. [Node.JS](https://nodejs.org/en/)
3. [Pnpm](https://pnpm.io/)
4. Alternatively, you can use [Docker](https://www.docker.com/) to build the application.

> \[!NOTE]\
> Make sure the correct versions of pnpm and Node.js are installed. They are specified under `engines` section in `package.json` file.

### Local development

1. Clone the repository using HTTPS, SSH, or Github CLI

   ```bash
   git clone https://github.com/IFRCGo/go-web-app.git #HTTPS
   git clone git@github.com:IFRCGo/go-web-app.git #SSH
   gh repo clone IFRCGo/go-web-app #Github CLI
   ```

2. Install the dependencies

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the `app` directory and add variables from [env.ts](https://github.com/IFRCGo/go-web-app/blob/develop/app/env.ts). Any variables marked with `.optional()` are not mandatory for setup and can be skipped.

   ```bash
   cd app
   touch .env
   ```

4. Start the development server:

   ```bash
   pnpm start:app
   ```

> \[!NOTE]\
> To work on a specific development task, ensure you have the backend setup appropriately and configured properly.

5. Create a new branch for your work.
   The stable branch for IFRC GO is `develop`, and all PRs for deployment should be merged into it.

   ```bash
   git checkout -b name-of-your-branch
   ```

   Create branches using the following convention

   * Project Branch: For long-running features, create branches under `project/project-x`.
   * Feature Branch: For small features, create branches under `feature/feature-name`.
   * Fix Branch: For bug fixes, create branches under `fix/issue-description`.
   * Chore Branch: For maintenance tasks, create branches under `chore/task-name`.

6. Once you're happy with your changes, add and commit them to your branch.If your workflow requires changesets (e.g., when changes will impact versioning or are part of a release), create one before committing. Then push the branch to origin.

   ```bash
   # Stage all changes
   git add .
   # Create a changeset (if changes will affect versioning, like new features or bug fixes)
   pnpm changeset

   # Commit your changes with a message
   git commit -m "some message"

   # Push your branch to origin
   git push -u origin name-of-your-branch
   ```

> \[!IMPORTANT]\
> Ensure no lint errors before pushing. Use clear, concise commit messages that summarize the changes, avoiding vague or generic descriptions.

> \[!NOTE]\
> Review the [Changesets documentation](./release.md#changesets) and the [versioning guidelines](./release.md#versioning-guidelines-for-ifrc-go-project) for more details on versioning and tracking changes.

7. Create a Pull Request.
   Please read the [Issues and Pull Requests](./issues-and-pull-requests.md) guide for further information.

> \[!IMPORTANT]\
> Before committing and opening a Pull Request, please ensure there are no lint errors. Also please create a pull request only when the feature is ready to be merged.

### CLI Commands

This repository contains several scripts and commands for performing tasks. The most relevant ones are described below.

#### Commands for Running & Building the Web Application

* `pnpm start:app` runs the Local Development Server, listening by default on `http://localhost:3000/`.
* `pnpm build` builds the Application in Production mode. The output is by default within the `build` folder.
  * This is used for Deployments (Preview & Production).
* `pnpm preview` previews the production build of the Application.
* `pnpm generate:type` generates the Typescript types for the API using `openapi-typescript`. The output is by default within the `generated` folder within the `app` workspace.
* `pnpm storybook` starts Storybook's local server for the `@ifrc-go/ui` components library, listening by default on `http://localhost:6006/`.
* `pnpm build-storybook` builds Storybook as a static web application for publishing.
* `pnpm build:ui` builds the `@ifrc-go/ui` components library. To reflect any new changes in the components library we must ensure that it is built beforehand.

#### Commands for Maintenance Tasks

* `pnpm lint` runs the linter for all the css, js, ts, and translation files.
* `pnpm lint:fix` attempts to fix any linting errors for css, js and ts files.
* `pnpm translatte:generate` generates translation migration file.
* `pnpm lint:unused` finds unused files, dependencies, and exports.

### IFRC GO UI Components Library

Please read the [README](../packages/ui/README.md) and [CONTRIBUTING](../packages/ui/CONTRIBUTING.md) guide for IFRC GO UI.

### IFRC GO UI Storybook

Please read the [README](../packages/go-ui-storybook/README.md) and [CONTRIBUTING](../packages/go-ui-storybook/CONTRIBUTING.md) guide.
