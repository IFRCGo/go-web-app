## Development

The stable branch for the IFRC GO application is `develop`. All PRs intended for deployment should be merged into the `develop` branch.

For long-running features, create PRs targeting the specific `project/project-x` branch when working on features related to that project.

### Prerequisites

To begin, ensure you have network access. Then, you'll need the following
1. [Git](https://git-scm.com/)
2. [Node.JS](https://nodejs.org/en/) version >=18 / 20+
3. [Yarn 1](https://classic.yarnpkg.com/en/)
4. Alternatively, you can use [Docker](https://www.docker.com/) to build the application.

### Local development

1. Clone the repository using HTTPS, SSH, or Github CLI
  ```bash
  git clone https://github.com/IFRCGo/go-web-app.git #HTTPS
  git clone git@github.com:IFRCGo/go-web-app.git #SSH
  gh repo clone IFRCGo/go-web-app #Github CLI
  ```
2. Install the dependencies
  ```bash
  yarn install
  ```
3. Copy `app/.env.example` to `app/.env` and update the variables
  ```bash
  cp app/.env.example app/.env
  ```
4. Start the development server
  ```bash
  yarn start:app
  ```
> [!NOTE]\
> To work on a specific development task, ensure you have the backend setup appropriately and configured properly.
5. Create a new branch for your work.
  ```bash
  git checkout -b name-of-your-branch
  ```
> [!IMPORTANT]\
>  Ensure there are no lint errors before pushing the changes. Ensure the commit message is clear and concise, summarizing the changes made in the commit. Avoid vague and generic messages. Instead, provide specific details that describe the purpose or impact of the changes.
6. Once you're happy with your changes, add and commit them to your branch.If your workflow requires changesets (e.g., when changes will impact versioning or are part of a release), create one before committing. Then push the branch to origin.
  ```bash
  # Stage all changes
  git add .
  # Create a changeset (if changes will affect versioning, like new features or bug fixes)
  yarn changeset

  # Commit your changes with a message
  git commit -m "some message"

  # Push your branch to origin
  git push -u origin name-of-your-branch
  ```

>[!NOTE]\
>Review the [Changesets documentation](./release.md#changesets) and the [versioning guidelines](./release.md#versioning-guidelines-for-ifrc-go-project) for more details on versioning and tracking changes.

> [!IMPORTANT]\
> Before committing and opening a Pull Request, please ensure there are no lint errors. Also please create a pull request only when the feature is ready to be merged.

7. Create a Pull Request.
Please read the [Issues and Pull Requests](./issues-and-pull-requests.md) guide for further information.

### CLI Commands

This repository contains several scripts and commands for performing tasks. The most relevant ones are described below.

<details>
  <summary>Commands for Running & Building the Web Application</summary>

- `yarn start:app` runs the Local Development Server, listening by default on `http://localhost:3000/`.
- `yarn build` builds the Application in Production mode. The output is by default within the `build` folder.
  - This is used for Deployments (Preview & Production).
- `yarn preview` previews the production build of the Application.
- `yarn generate:type` generates the Typescript types for the API using `openapi-typescript`. The output is by default within the `generated` folder within the `app` workspace.
- `yarn storybook` starts Storybook's local server for the `@ifrc-go/ui` components library, listening by default on `http://localhost:6006/`.
- `yarn build-storybook` builds Storybook as a static web application for publishing.
- `yarn build:ui` builds the `@ifrc-go/ui` components library. To reflect any new changes in the components library we must ensure that it is built beforehand.
</details>

<details>
  <summary>Commands for Maintenance Tasks</summary>
Execute the following commands within the `app` workspace.

- `yarn lint` runs the linter for all the css, js, ts, and translation files.
  - `yarn lint:fix` attempts to fix any linting errors for css, js and ts files.
- `yarn translatte:generate` generates translation migration file.
- `yarn surge:deploy` builds and deploys the web application to [surge](https://surge.sh/).
</details>


### UI components library
Please read the [README](../packages/ui/README.md) and [CONTRIBUTING](../packages/ui/CONTRIBUTING.md) guide for IFRC GO UI.

### Storybook
Please read the [README](../packages/go-ui-storybook/README.md) and [CONTRIBUTING](../packages/go-ui-storybook/CONTRIBUTING.md) guide.

