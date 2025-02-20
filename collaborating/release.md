## IFRC GO Release Workflow

The IFRC Go web application deployment occurs across nightly, staging, and production instances via [Azure Pipelines](https://azure.microsoft.com/en-us/products/devops/pipelines). The environment variables must be properly configured for the deployment workflow to run smoothly.

We use [changesets](https://github.com/changesets/changesets) to manage versioning and generate changelogs for each release. The version must be updated with each release, and the deployment is carried out through the `develop` branch.

### Changesets

#### When is changesets required in IFRC GO?

* **New Features**: When you add new functionality that users can interact with. This requires version bumping to signal a feature addition.
* **Bug Fixes**: For resolving issues that affect existing functionality, ensuring a version bump and clear changelog entries.
* **Breaking Changes**: When changes may disrupt existing workflows or integrations, reflecting this with a major version increment.

changesets isn't required for internal-only updates, minor refactoring, or documentation changes that don't impact functionality.

### Versioning Guidelines for IFRC GO Project

In the IFRC GO project, we follow [SemVer](https://semver.org/) (Semantic Versioning) to maintain consistency and clarity. Here's a quick guide to determine whether your changes should be categorized as a patch, minor, or major version update

1. **Patch Version (x.y.*patch*)**
   * Bug fixes, small tweaks, or performance improvements.

2. **Minor Version (x.*minor*.z)**
   * Adding new features.

3. **Major Version (*major*.y.z)**
   * Introducing a significant new features.

> \[!TIP]\
> When in doubt, favor **patch** or **minor** updates to avoid unnecessary major releases.

### Before Release

1. Ensure all changes have been merged into the `develop` branch.

2. Fetch and checkout the latest `develop` branch
   ```bash
   git fetch
   git checkout develop
   git pull --rebase
   ```

3. Verify that changesets have been created.

4. Update the version by running
   ```bash
   pnpm changeset version
   ```
   This command consumes all changesets and updates the version according to semantic versioning. It also writes changelog entries for each consumed changeset. Review the changelog entries and version changes for packages. Make any necessary adjustments to the changelogs.

5. Commit the changes with the new version number as the commit message
   ```bash
   git commit -m "v{go-web-app-version-number}"
   ```

6. Push the commit to the origin
   ```bash
   git push origin develop
   ```

> \[!IMPORTANT]\
> Make sure you have the necessary permissions to push to the develop branch. If you don't have the credentials, push to a different branch and send a PR targeting the develop branch.

7. Generate a git tag for the current version of all packages
   ```bash
   pnpm changeset tag
   ```

> \[!IMPORTANT]\
> Ensure all existing tags are fetched from the remote repository before generating new tags with `pnpm changeset tag`. This can be done using `git fetch --tags` to ensure you have the latest tags in your local repository, which helps avoid potential conflicts or issues with tag generation.

8. Push the generated tags to the origin
   ```bash
   git push --follow-tags
   ```

> \[!IMPORTANT]\
> Always verify that the IFRC GO UI package is published to npm when its version is updated. For a step-by-step guide, refer to the [IFRC GO UI Release Workflow](#ifrc-go-ui-release-workflow).

### Nightly/Staging/Production Release using Azure Pipelines

TODO Add azure pipelines deployment documentation

## IFRC GO UI Release Workflow

To release the IFRC Go UI to [NPM](https://www.npmjs.com/) using [changesets](https://github.com/changesets/changesets), follow these steps. Ensure you have the necessary credentials and publishing rights to the [ifrc-go/ui](https://www.npmjs.com/org/ifrc-go) package.

### NPM Release Steps

> \[!NOTE]\
> Make sure to update the package version and generate the changelog by following the steps 1 to 6 outlined in the [Before Release](#before-release) section.

1. Login to NPM
   ```bash
   npm login
   ```

> \[!NOTE]\
> Ensure you have the appropriate rights to publish the package.

2. Publish the Package
   ```bash
   pnpm changeset publish
   ```
3. Push Tags to origin
   ```bash
   git push --follow-tags
   ```

## IFRC GO UI Storybook Release Workflow

The Go UI Storybook is deployed to [Chromatic](https://www.chromatic.com/) using the [Publish to Chromatic](https://github.com/marketplace/actions/publish-to-chromatic) GitHub action. This action is configured to detect changes in the `packages/ui` or `packages/go-ui-storybook` directories and deploy only when modifications are found.

The Storybook can be accessed [here](https://66557be6b68dacbf0a96db23-jsfajnuhcv.chromatic.com/).
