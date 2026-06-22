# Readme addendum for NRW

Some of the [readme](./README.md) instructions don't work or are incomplete. Rather than writing over the original readme and risk PRs getting held up over comments on strings, use this as the troubleshooting addendum.

### Local Development

2. Initialize submodules

   If you want to run the GO backend, you need to init the submodules.

   ```bash
   git submodule update --init --remote
   ```

   If this fails, you may need to manually checkout the directories.
   You can either work from HEAD or get the specific commit that your target branch is using by going to the repo online (at Github), or by looking at your local submodule settings.
   Online, you'd see in the root dir something like this: `go-risk-module-api @ e6afd9b`. Use the last string as your commit to check out to.

   To run this, navigate to the repo base directory and run the following. It removes the directories if they exist,
   and then clones into that location at a specific commit.

   ```bash
   rm -rf go-api go-risk-module-api
   git clone https://github.com/IFRCGo/go-api.git go-api && (cd go-api && git checkout cda57b1)
   git clone https://github.com/IFRCGo/go-risk-module-api.git go-risk-module-api && (cd go-risk-module-api && git checkout e6afd9b)
   ```

3. Install the dependencies:

Added note: If you're not running the backend, you can just run this from the app/ dir.

4. Setup `.env` file:

```shell
cp app/sample.env app/.env
```

Adjust settings as needed.

You can get the `FONTAWESOME_API_KEY` from the NLRC BitWarden page, or login to the NLRC FontAwesome account, and get it from there. If it has already been set in GitHub secrets, you can get it from there as well. This is needed to build locally.

### Github setup

The CI workflow needs to build the UI library. To do this, you must set the `FONTAWESOME_API_KEY` in the GitHub secrets. See above on how to get this.

1. In the GitHub repo, go to **Settings → Secrets and variables → Actions → New repository secret**.
1. Name the new secret `FONTAWESOME_API_KEY` and paste the token as the value, then save.

### Adding spellchecker corrections

The spell checker is easily confused by acronyms and country codes. You can add exceptions in `typos.toml` under `[default.extend-words]`. These are case-sensitive.

### NRW Portal

For running the NRW portal, see [the NRW readme.](app/src/components/NrwMap/readme.md)

### .vscode settings

The hope is to make the .vscode file as part of the repo if possible. For now, the contents are shared here. To use this, copy it into the `settings.json` file in the `<repo root>/.vscode/` directory. If either of these don't yet exist, create them.

``` JSON
{
    "editor.formatOnSave": false,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit",
        "source.fixAll.stylelint": "explicit"
    },
    "eslint.workingDirectories": ["app", "packages/ui", "packages/go-ui-storybook"],
    "eslint.format.enable": true,
    "editor.defaultFormatter": "dbaeumer.vscode-eslint",
    "[typescript]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    },
    "[typescriptreact]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    },
    "[javascript]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    },
    "[javascriptreact]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    },
    "[css]": {
    "editor.defaultFormatter": "stylelint.vscode-stylelint"
    }
}
```
