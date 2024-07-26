## Issues
Use the repository's [Issues](https://github.com/IFRCGo/go-web-app/issues) tab to report bugs, suggest features, and track tasks. Provide clear and detailed descriptions, including steps to reproduce bugs if applicable.

## Pull Requests
Before you submit your Pull Request (PR) consider the following guidelines.

Please make your changes in a new Git branch following our branch naming conventions. We should use prefixes in branch names:
- **Project branches**: Prefixed with `project/`, these branches are for long-running features.
- **Feature branches**: Prefixed with `feature/`, these branches are used to develop new features.
- **Bugfix branches**: Prefixed with `fix/`, these branches are used to make fixes.
- **Release branches**: Prefixed with `release/`, these branches prepare the codebase for new releases.
- **Hotfix branches**: Prefixed with `hotfix/`, these branches address urgent issues in production.

> [!IMPORTANT]\
>  The name of the branch should be descriptive, concise and consistent. We should use lowercase letters and dashes instead of spaces in branch names to ensure compatibility across different operating systems and Git hosting platforms.

```bash
git checkout -b feature/new-feature-a develop
```

Add your changes, ensuring they follow code style guidelines. Run linting, perform type checking, and ensure the build passes.

Run `yarn changeset` in the root of the repository and describe your changes. The resulting files should be committed as they will be used during release.

Commit your changes with a clear and descriptive message that adheres to our commit message conventions.

Push your branch to GitHub following our branch naming conventions.
```bash
git push origin feature/new-feature-a
```

On GitHub, open a pull request targeting the `develop` branch or, for changes related to a long-running project, the specific `project/project-a` branch.

If we suggest changes, then make the required updates.

Rebase your branch and force push with `force-with-lease`.

If the target branch is `develop`
```bash
git rebase develop
git push --force-with-lease
```
If the target branch is a `project` branch
```bash
git rebase project/project-a
git push --force-with-lease
```
