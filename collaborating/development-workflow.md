# IFRC GO - Development Workflow

## Overview

[IFRC GO](https://go.ifrc.org) is a React + Vite + TypeScript application managed as a [pnpm monorepo](https://pnpm.io/workspaces). The main application lives in `app/`, shared UI components in `packages/ui/`, and three git submodules provide OpenAPI schemas for TypeScript type generation (`pnpm generate:type`):

- [go-api](../go-api/) — the main GO backend API. Its OpenAPI schema generates the core TypeScript types used throughout the app.
- [go-risk-module-api](../go-risk-module-api/) — the GO risk module API. Its OpenAPI schema generates risk-specific TypeScript types.
- [cacheppuccino](../cacheppuccino/) — a translation caching service that serves translated strings at runtime. Its OpenAPI schema generates translation TypeScript types, and its endpoint is configured via the `APP_TRANSLATION_API_ENDPOINT` environment variable.

For large bodies of work, a dedicated **project branch** acts as a shared integration point before anything reaches `develop`. Small, self-contained changes skip the project branch and go directly to `develop`.

For alpha, staging, and production deployments, see [Deployment Workflow](./deployment-workflow.md).

---

## Prerequisites

| Tool | Version |
|---|---|
| [Git](https://git-scm.com/) | - |
| [Node.js](https://nodejs.org/en/) | `20` (see `engines` in `package.json`) |
| [pnpm](https://pnpm.io/) | `10.6.1` (see `engines` in `package.json`) |
| [Docker](https://www.docker.com/) (optional) | For containerised builds |

---

## Local Development

1. Clone the repository using HTTPS, SSH, or Github CLI

   ```bash
   git clone https://github.com/IFRCGo/go-web-app.git #HTTPS
   git clone git@github.com:IFRCGo/go-web-app.git #SSH
   gh repo clone IFRCGo/go-web-app #Github CLI
   ```

2. Initialize submodules

   ```bash
   git submodule update --init --recursive --remote
   ```

3. Install the dependencies

   ```bash
   pnpm install
   ```

4. Create a `.env` file in the `app` directory and add variables from [env.ts](https://github.com/IFRCGo/go-web-app/blob/develop/app/env.ts). Any variables marked with `.optional()` are not mandatory for setup and can be skipped.

   ```bash
   cd app
   touch .env
   ```

5. Start the development server:

   ```bash
   pnpm start:app
   ```

> [!NOTE]\
> To work on a specific development task, ensure you have the backend setup appropriately and configured properly.

---

## Branch Structure

| Branch | Purpose | Created from |
|---|---|---|
| `develop` | Main integration branch. Always deployable to staging. | - |
| `project/<n>` | Integration branch for a large feature set (e.g. `project/eap`). | `develop` |
| `feature/<slug>` | New functionality (e.g. `feature/eap-landing-page`, `feature/seap-form`). | `project/<n>` or `develop` |
| `fix/<slug>` | Bug fixes (e.g. `fix/disputed-boundary-map-styling`). | `project/<n>` or `develop` |
| `chore/<slug>` | Dependency updates, CI changes, tooling (e.g. `chore/upgrade-vite`). | `develop` |
| `doc/<slug>` | Documentation-only changes (e.g. `doc/deployment-workflow`). | `develop` |

> `chore/` and `doc/` branches typically go straight to `develop` - they do not need a
> project branch or an alpha deployment.

---

## Step-by-Step Workflow

### 1. Branch out the project branch

```bash
git checkout develop
git pull origin develop
git checkout -b project/eap
git push origin project/eap
```

Use a project branch when the scope involves multiple features, cross-cutting changes, or a distinct release milestone (e.g. a new module like EAP). For isolated fixes or small features, create a branch directly off `develop`.

---

### 2. Create feature branches from the project branch

```bash
git checkout project/eap
git checkout -b feature/eap-landing-page
# or
git checkout -b fix/eap-form-validation
```

Each developer creates their own branch off the project branch - never off `develop` while the project branch is active. Name branches with the appropriate prefix and a short, descriptive slug tied to the project.

---

### 3. Open PRs to the project branch, rebase and merge

When a branch is ready:

1. Push and open a pull request targeting `project/eap` (not `develop`).
2. Rebase onto the latest project branch before merging:

```bash
git fetch origin
git rebase origin/project/eap
# resolve conflicts if any
git push --force-with-lease origin feature/eap-landing-page
```

3. Merge using **rebase merge** to keep a linear history on the project branch.

> The repo uses `@changesets/cli` for versioning. If your PR introduces user-facing
> changes, add a changeset before merging:
>
> ```bash
> pnpm changeset add
> ```
>
> This creates a file in `.changeset/`. Commit it alongside your changes. PRs without a changeset are fine for internal refactors, type fixes, and chores.
>
> Review the [Changesets documentation](./release.md#changesets) and the [versioning guidelines](./release.md#versioning-guidelines-for-ifrc-go-project) for more details.

> [!IMPORTANT]\
> Ensure no lint errors before pushing. Use clear, concise commit messages that summarize the changes, avoiding vague or generic descriptions. Create a pull request only when the feature is ready to be merged.

---

### 4. Prepare translation migrations and changeset in the project branch

Before merging to `develop`, complete the following steps in the project branch.

**Generate and update translation strings:**

```bash
pnpm translatte:generate
```

This script (defined in `app/package.json`) scans the codebase for `i18n` key usage and generates or updates the string files. Commit the result - the output goes into `app/src/` alongside the relevant component `i18n.json` files.

**Add or update translation migration files:**

Any new or renamed string namespaces require a migration entry in the
`translationMigrations/` directory so existing translations are carried forward correctly on deploy.

> [!NOTE]\
> Only one translation migration should exist per project branch. If multiple feature branches generated their own migrations, consolidate them into a single migration before merging to `develop`.

**Verify the changeset:**

Confirm that a changeset exists in `.changeset/` for every user-facing change introduced by the project branch. Run `pnpm changeset status` to see a summary:

```bash
pnpm changeset status
```

---

### 5. Merge the project branch to develop

```bash
git checkout develop
git pull origin develop
git merge --no-ff project/eap
git push origin develop
```

Once the project branch is merged to `develop`, proceed with the [Deployment Workflow](./deployment-workflow.md) to release to staging and production.

---

## Rebase Mechanism - Keeping the Project Branch Current

As development continues, `develop` receives commits from other work: hotfixes, unrelated features, dependency bumps. The project branch was created from an older commit of `develop` and will gradually fall behind.

### Why this matters

If the project branch diverges too far, merging it back becomes expensive - conflicts accumulate and the integration is risky. Rebasing regularly keeps the diff small and predictable.

### How to rebase the project branch onto develop

```bash
git checkout project/eap
git fetch origin
git rebase origin/develop
# resolve conflicts one commit at a time if they appear
git push --force-with-lease origin project/eap
```

This replays every commit that is on `project/eap` but not on `develop` on top of the latest `develop` commit. The result is a project branch that shares `develop`'s history at its base.

### When to rebase

- **Regularly** - at minimum once a week during active development.
- **Before opening PRs** from feature branches into the project branch, so the feature
  is already based on a recent project branch state.
- **Before merging to develop** - do a final rebase to minimise integration friction.

### Force-pushing after a rebase

A rebase rewrites commit SHAs, so a force-push is required. Always use
`--force-with-lease` rather than `--force`: it refuses to overwrite if someone else has pushed to the branch since your last fetch, protecting against accidental data loss.

```bash
git push --force-with-lease origin project/eap
```

After the project branch is rebased, each developer should also rebase their open feature branch onto the updated project branch:

```bash
git checkout feature/eap-landing-page
git rebase origin/project/eap
git push --force-with-lease origin feature/eap-landing-page
```

---

## Pre-merge Checklist

Before merging the project branch to `develop`:

- [ ] All feature/fix PRs are merged to the project branch
- [ ] Project branch is rebased on top of the latest `develop`
- [ ] QA has passed on the alpha instance
- [ ] `pnpm translatte:generate` has been run and i18n files are committed
- [ ] Translation migration files are added to `translationMigrations/` for any new or renamed namespaces
- [ ] Changesets are present in `.changeset/` for all user-facing changes (`pnpm changeset status`)
- [ ] No open blockers from QA

---

## CLI Commands

### Running & Building

| Command | What it does |
|---|---|
| `pnpm start:app` | Start the dev server (`http://localhost:3000/`) |
| `pnpm build` | Build the production bundle (output in `build/`) |
| `pnpm preview` | Preview the production build locally |
| `pnpm generate:type` | Regenerate TypeScript types from the OpenAPI schema |
| `pnpm storybook` | Start Storybook for `@ifrc-go/ui` (`http://localhost:6006/`) |
| `pnpm build-storybook` | Build Storybook as a static web application |
| `pnpm build:ui` | Build the `@ifrc-go/ui` components library |

### Maintenance

| Command | What it does |
|---|---|
| `pnpm lint` | Run linters for CSS, JS, TS, and translation files |
| `pnpm lint:fix` | Auto-fix lint errors for CSS, JS, and TS files |
| `pnpm lint:unused` | Find unused files, dependencies, and exports |
| `pnpm translatte:generate` | Generate translation migration file |
| `pnpm changeset add` | Create a new changeset entry |
| `pnpm changeset status` | Preview pending version bumps |

---

## IFRC GO UI Components Library

Please read the [README](../packages/ui/README.md) and [CONTRIBUTING](../packages/ui/CONTRIBUTING.md) guide for IFRC GO UI.

## IFRC GO UI Storybook

Please read the [README](../packages/go-ui-storybook/README.md) and [CONTRIBUTING](../packages/go-ui-storybook/CONTRIBUTING.md) guide.

---

## Notes

- **Avoid opening PRs from feature or fix branches directly to `develop`** while a project branch is active. All project work flows through the project branch first. Only except for bug-fixes, ad-hoc works!
- For more on pull requests, see [Issues and Pull Requests](./issues-and-pull-requests.md).
- For more on contributing, see [`CONTRIBUTING.md`](../CONTRIBUTING.md) and the docs in [`collaborating/`](./).
