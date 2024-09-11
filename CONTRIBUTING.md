# IFRC GO Web Application Contributing Guide

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution.

## Table of Contents

- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
- [What should I know before I get started?](#what-should-i-know-before-i-get-started)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Becoming a Collaborator](#becoming-a-collaborator)
- [Getting started](#getting-started)

## I Have a Question

> If you want to ask a question, we assume that you have read the available [documentation](https://go-wiki.ifrc.org/en/home).

Before you ask a question, it is best to search for existing [issues](https://github.com/IFRCGo/go-web-app/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open a [discussion](https://github.com/IFRCGo/go-web-app/discussions).
- Open an [issue](https://github.com/IFRCGo/go-web-app/issues/new/choose).
- Provide as much context as you can about what you're running into.

## I Want To Contribute

Any individual is welcome to contribute to IFRC GO. The repository currently has two kinds of contribution personas:

- A **Contributor** is any individual who creates an issue/PR, comments on an issue/PR, or contributes in some other way.
- A **Collaborator** is a contributor with write access to the repository.

### What should I know before I get started?

### IFRC GO and Packages

[IFRC GO](https://github.com/IFRCGo) constitutes a significant open-source initiative aimed at seamlessly connecting information regarding emergency needs with the appropriate response. This overarching goal is achieved by ensuring the precision and accessibility of the utilized data. The project is hosted at [https://go.ifrc.org/](https://go.ifrc.org/).

The project comprises several [repositories](https://github.com/orgs/IFRCGo/repositories), with notable ones including:
* [go-web-app](https://github.com/IFRCGo/go-web-app/) -  The frontend repository for the IFRC GO project.
* [go-api](https://github.com/IFRCGo/go-api) - The backed repository for the IFRC GO project.
* [go-ui](https://github.com/IFRCGo/go-web-app/tree/develop/packages/ui) - The UI components library for the IFRC GO platform.

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Verify whether the issue you're encountering is indeed a bug and not an error on your end. Make sure to review the documentation.
- Before reporting a bug, check if there is an existing bug report in the bug tracker to see if other users have faced and potentially resolved the same issue.
- Gather relevant information and environment
  - Operating System and Version
  - Web Browser and Version
  - Device Type
- Can you consistently reproduce the issue?

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/IFRCGo/go-web-app/issues/new/choose). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Use a **clear and descriptive title** for the issue to identify the problem.
- Explain the **behavior you would expect and the actual behavior** and point out what exactly is the problem with that behavior.
- Please **provide as much context as possible** and describe the *reproduction steps* that someone else can follow to recreate the issue on their own.
- Please **include visual proof of the bug**. This could be screenshots, animated GIFs, logs.
- Provide the **information you collected in the previous section.**

Once it's filed
- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for IFRC GO. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

#### Before Submitting an Enhancement

- Read the [documentation](https://go-wiki.ifrc.org/en/home) carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](https://github.com/IFRCGo/go-web-app/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's stakeholders of the merits of this feature.

#### How Do I Submit a Good Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://github.com/IFRCGo/go-web-app/issues).
- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
- You may want to **include screenshots and animated GIFs** which help you demonstrate the steps or point out the part which the suggestion is related to.
- **Explain why this enhancement would be useful** to most IFRC GO users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

## Becoming a Collaborator

A collaborator to the IFRC GO Web Application repository is an integral member of the IFRC GO Web Application Team. This team holds primary responsibility for the technical advancement of the IFRC GO Web Application. As such, members are expected to possess substantial expertise in contemporary web technologies and standards.

For more comprehensive details and guidelines on collaborating with this repository, please refer to our [Collaboration Guide](./COLLABORATING.md).

### Getting started

Below are the steps to guide you through preparing your local environment for the IFRC GO Web Application development. The repository is set up as a [monorepo](https://monorepo.tools/). The app directory houses the application code, while the packages directory contains related packages, including the [IFRC GO UI](https://www.npmjs.com/package/@ifrc-go/ui) components library.

### Prerequisites

To begin, ensure you have network access. Then, you'll need the following
1. [Git](https://git-scm.com/)
2. [Node.JS](https://nodejs.org/en/) version >=18 / 20+
3. [pnpm](https://pnpm.io/)
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
pnpm install
```
3. Copy `app/.env.example` to `app/.env` and update the variables
```bash
cp app/.env.example app/.env
```
4. Start the development server
```bash
pnpm start
```
> [!NOTE]\
> To work on a specific development task, ensure you have the backend setup appropriately and configured properly.
5. Create a new branch for your work.
```bash
git checkout -b name-of-your-branch
```
> [!IMPORTANT]\
>  Ensure there are no lint errors before pushing the changes. Ensure the commit message is clear and concise, summarizing the changes made in the commit. Avoid vague and generic messages. Instead, provide specific details that describe the purpose or impact of the changes.
6. Once you're happy with your changes, add and commit them to your branch, then push the branch to origin.
```bash
git add .
git commit -m "some message"
git push -u origin name-of-your-branch
```
> [!NOTE]\
> Before committing and opening a Pull Request, please ensure there are no lint errors. Also please create a pull request only when the feature is ready to be merged.

7. Create a Pull Request.

### Build for Production

1. To build the application for production
```bash
pnpm build
```
2. To locally preview the production build
```bash
pnpm preview
```

### CLI Commands

This repository contains several scripts and commands for performing tasks. The most relevant ones are described below.

<details>
  <summary>Commands for Running & Building the Web Application</summary>
  - `pnpm start` runs the Local Development Server, listening by default on `http://localhost:3000/`.
  - `pnpm build` builds the Application in Production mode. The output is by default within the `build` folder. Additionally, This command builds both the `@ifrc-go/ui` library and the associated Storybook.
    - This is used for Deployments (Preview & Production).
  - `pnpm preview` previews the production build of the Application.
  - `pnpm storybook` starts Storybook's local server for the `@ifrc-go/ui` components library, listening by default on `http://localhost:6006/`.
  - `pnpm build:storybook` builds Storybook as a static web application for publishing.
  - `pnpm build:ui` builds the `@ifrc-go/ui` components library. To reflect any new changes in the components library we must ensure that it is built beforehand.
</details>

<details>
  <summary>Commands specific to the actual Web Application</summary>
  > [!NOTE]\
  > Execute the following commands within the `app` workspace.
  - `pnpm generate:type` generates the Typescript types for the API using `openapi-typescript`. The output is by default within the `generated` folder within the `app` workspace.
  - `pnpm preview` previews the production build of the Application.
  - `pnpm surge:deploy` deploy the web application to [surge](https://surge.sh/) for feature tests.
  - `pnpm surge:teardown` removes the deployed web application from [surge](https://surge.sh/).
  > [!IMPORTANT]\
  > Deploy to Surge only when necessary. A Surge account is required for deployment, and the deployment should always be torn down after the feature tests are completed.
</details>

<details>
  <summary>Commands for Maintenance Tasks</summary>
  - `pnpm lint`: Runs the linter for all CSS, JS, TS, and translation files across all packages.
  - `pnpm lint:fix`: Attempts to fix linting errors in CSS, JS, and TS files for all packages.
  - `pnpm typecheck`: Checks for type issues in all packages.
</details>
