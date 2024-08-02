## IFRC Go Release Workflow

The IFRC Go web application deployment occurs across nightly, staging, and production instances via [Azure Pipelines](https://azure.microsoft.com/en-us/products/devops/pipelines). The environment variables must be properly configured for the deployment workflow to run smoothly.

We use [changesets](https://github.com/changesets/changesets) to manage versioning and generate changelogs for each release. The version must be updated with each release, and the deployment is carried out through the `develop` branch.

### Before Release

1. Ensure all changes have been merged into the `develop` branch.
2. Checkout the latest `develop` branch
   ```bash
   git checkout develop
   git pull --rebase
   ```
3. Verify that changesets have been created.
4. Update the version by running
   ```bash
   yarn changeset version
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
> [!IMPORTANT]\
>  Make sure you have the necessary permissions to push to the develop branch. If you don't have the credentials, push to a different branch and send a PR targeting the develop branch.
7. Generate a git tag for the current version of all packages
   ```bash
   yarn changeset tag
   ```
8. Push the generated tags to the origin
   ```bash
   git push --follow-tags
   ```

### Nightly/Staging/Production Release using Azure Pipelines
TODO Add azure pipelines deployment documentation

## IFRC Go UI Release Workflow

To release the IFRC Go UI to [NPM](https://www.npmjs.com/) using [changesets](https://github.com/changesets/changesets), follow these steps. Ensure you have the necessary credentials and publishing rights to the [ifrc-go/ui](https://www.npmjs.com/org/ifrc-go) package.

### NPM Release Steps

1. Ensure Changes Are Merged
   - Make sure all changes have been merged into the `develop` branch.

2. Checkout `develop` Branch
   ```bash
   git checkout develop
   ```

3. Verify Changesets
   - Confirm that changesets have been created.

4. Update the Version
   ```bash
   yarn changeset version
   ```
5. Commit Version Update
   ```bash
   git commit -m "v{go-web-app-version-number}"
   ```
6. Push Commit to Origin
   ```bash
   git push origin develop
   ```
> [!NOTE]\
> Ensure you have the necessary permissions to push to the `develop` branch. If not, push to a different branch and create a PR targeting the `develop` branch.
7. Login to NPM
   ```bash
   npm login
   ```
> [!NOTE]\
>Ensure you have the appropriate rights to publish the package.
8. Publish the Package
   ```bash
   yarn changeset publish
   ```
9. Push Tags to origin
   ```bash
   git push --follow-tags
   ```

## IFRC Go UI Storybook Release Workflow

The Go UI Storybook is deployed to [Chromatic](https://www.chromatic.com/) using the [Publish to Chromatic](https://github.com/marketplace/actions/publish-to-chromatic) GitHub action. This action is configured to detect changes in the `packages/ui` or `packages/go-ui-storybook` directories and deploy only when modifications are found.

The Storybook can be accessed [here](https://66557be6b68dacbf0a96db23-jsfajnuhcv.chromatic.com/).
