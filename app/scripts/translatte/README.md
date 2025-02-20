# translatte

A simple script to synchronize translations in source code to translations in
server

## Usecase

### Generating migrations

When adding a new feature or updating existing feature or removing an
existing feature on the codebase, we may need to update the strings used
in the application.

Developers can change the translations using their preferred choice of editor.

Once all of the changes have been made, we can generate a migration file for the translations using:

```bash
pnpm translatte generate-migration ./src/translationMigrations ./src/**/i18n.json
```

Once the migration file has been created, the migration file can be committed to the VCS.

### Applying migrations

When we are deploying the changes to the server, we will need to update
the strings in the server.

We can generate the new set of strings for the server using:

```bash
pnpm translatte apply-migrations ./src/translationMigrations --last-migration "name_of_last_migration" --source "strings_json_from_server.json" --destination "new_strings_json_for_server.json"
```

### Merge migrations

Once the migrations are applied to the strings in the server, we can merge the migrations into a single file.

To merge migrations, we can run the following command:

```bash
pnpm translatte merge-migrations ./src/translationMigrations --from 'initial_migration.json' --to 'final_migration.json'
```

### Checking migrations

We can use the following command to check for valid migrations:

```bash
pnpm translatte lint ./src/**/i18n.json
```

### Listing migrations

We can use the following command to list all migrations:

```bash
pnpm translatte list-migrations ./src/translationMigrations
```
