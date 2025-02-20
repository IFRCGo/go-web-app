## Issues

Use the [Issues](https://github.com/IFRCGo/go-web-app/issues) tab to report bugs, suggest features, and track tasks. Provide clear descriptions and, for bugs, include steps to reproduce them.

## Pull Requests

* Open a pull request targeting the `develop` branch or, for long-running projects, the relevant `project/project-a` branch.
* Use a clear and descriptive title, and fill in all relevant details, including dependent branches.
* Perform a self-review and ensure all PR checks pass.
* If changes are requested, make the necessary updates.

Before pushing updates, rebase your branch and use `force-with-lease`.

For the `develop` branch

```bash
git rebase develop
git push --force-with-lease
```

For a `project` branch

```bash
git rebase project/project-a
git push --force-with-lease
```
