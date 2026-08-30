## IFRC GO Translation

The IFRC GO application supports the four official languages of the IFRC: English, French, Spanish, and Arabic.

### Overview

Translation strings are stored in `i18n.json` files co-located with each component or view (e.g. `app/src/views/Home/i18n.json`). These files are the source of truth for all translatable strings. A custom CLI tool called **translatte** (located at `app/scripts/translatte/`) manages the full lifecycle of translations: linting, generating migration files, and pushing strings to the translation server.

At runtime the application fetches translations from the **cacheppuccino** service, a translation caching service whose endpoint is configured via the `APP_TRANSLATION_API_ENDPOINT` environment variable.

### Adding or Changing Strings

1. Edit the relevant `i18n.json` file alongside the component.
2. Lint the translation files to catch duplicates or formatting errors:

   ```bash
   pnpm translatte lint ./src/**/i18n.json
   ```

3. Generate a migration file that captures the diff between the current strings and the last recorded state:

   ```bash
   pnpm translatte generate-migration ./src/translationMigrations ./src/**/i18n.json
   ```

   Or using the convenience script:

   ```bash
   pnpm translatte:generate
   ```

4. Commit the new migration file alongside your code changes.

> **Note:** Prefer only one translation migration file per PR to avoid unnecessary intermediate migrations. If you have multiple commits that change translation strings, regenerate the migration so that the PR contains a single migration file. Additionally, translation migrations should only be included in PRs that target `develop`.

### Translatte CLI Reference

All commands are run from within the `app/` workspace directory. Each command below is prefixed with `translatte` (e.g. `pnpm translatte <command> <arguments>`).

| Command | Arguments | Description |
|---|---|---|
| `lint` | `<TRANSLATION_FILE..>` | Lint `i18n.json` files for duplicated strings. Pass `--fix` to auto-fix. |
| `lint-migrations` | `<MIGRATION_DIR_PATH>` | Lint migration files for diverging migrations. |
| `list-migrations` | `<MIGRATION_FILE_PATH>` | List all migration files. |
| `generate-migration` | `<MIGRATION_FILE_PATH> <TRANSLATION_FILE..>` | Generate a new migration file from current translation files. |
| `merge-migrations` | `<MIGRATION_FILE_PATH> --from <file> --to <file>` | Merge a range of migration files into one. |
| `apply-migrations` | `<MIGRATION_FILE_PATH> --source <file> --destination <file>` | Apply pending migrations to a strings JSON file. |
| `export-migration-to-excel` | `<MIGRATION_FILE_PATH> <OUTPUT_DIR>` | Export a migration file to XLSX for external translators. |
| `push-strings-from-excel` | `<IMPORT_FILE_PATH> --api-url <url> --auth-token <token>` | Push translated strings from an XLSX file to the GO API. |
| `push-strings-from-excel-to-ifrc` | `<IMPORT_FILE_PATH> --api-url <url> --api-key <key> --application-id <id>` | Push translated strings from an XLSX file to the IFRC translation service. |
| `push-migrations-to-go` | `<MIGRATION_DIR_PATH> --api-url <url> --auth-token <token>` | Push pending migrations directly to the GO API. |
| `push-migrations-to-ifrc` | `<MIGRATION_DIR_PATH> --api-url <url> --api-key <key> --application-id <id>` | Push pending migrations to the IFRC translation service. |
| `export-server-strings` | `<API_URL>` | Export current server strings to an XLSX file. |
| `export-strings-for-mock` | `<TRANSLATION_FILE..> --api-url <url> --api-key <key> --application-id <id>` | Export local i18n strings as an IFRC-service-format XLSX, filling translations from the service (mock source for the translation cache server). |
| `clear-server-strings` | `--api-url <url> --auth-token <token>` | Remove all existing strings from the server. |

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `APP_TRANSLATION_API_ENDPOINT` | Yes | Base URL for the cacheppuccino translation caching service. |

### Translation Workflow (Deployment)

1. Developer adds/changes strings and generates a migration file (`translatte generate-migration`).
2. Migration file is committed and merged into `develop`.
3. During deployment, migrations are applied to produce an updated strings JSON (`translatte apply-migrations`).
4. The updated strings are pushed to the server (`translatte push-migrations-to-go` or `translatte push-migrations-to-ifrc`).
5. Translators receive an XLSX export (`translatte export-migration-to-excel`), translate the new strings, and the translated file is pushed back (`translatte push-strings-from-excel-to-ifrc`).
