import { MigrationActionItem, MigrationFileContent } from '../types';
import {
    getMigrationFilesAttrs,
    readMigrations,
    removeFiles,
    writeFilePromisify,
    mergeMigrationActionItems
} from '../utils';

export function merge(migrationFileContents: MigrationFileContent[]) {
    const migrationActionItems = migrationFileContents.reduce<MigrationActionItem[]>(
        (acc, migrationActionItem) => {
            const newMigrationItems = mergeMigrationActionItems(acc, migrationActionItem.actions)
            return newMigrationItems;
        },
        [],
    );

    return migrationActionItems;
}

async function mergeMigrations(
    projectPath: string,
    path: string,
    from: string,
    to: string,
    dryRun: boolean | undefined,
) {
    const migrationFilesAttrs = await getMigrationFilesAttrs(projectPath, path);
    const selectedMigrationFilesAttrs = migrationFilesAttrs.filter(
        (item) => (item.migrationFileName >= from && item.migrationFileName <= to)
    );
    console.info(`Found ${selectedMigrationFilesAttrs.length} migration files`);

    if (selectedMigrationFilesAttrs.length <= 1) {
        throw 'There should be atleast 2 migration files';
    }
    const selectedMigrations = await readMigrations(
        selectedMigrationFilesAttrs.map((migration) => migration.filePath),
    );

    const firstMigration= selectedMigrations[0];
    const lastMigration = selectedMigrations[selectedMigrations.length - 1];

    const selectedMigrationsFileNames = selectedMigrationFilesAttrs.map((migration) => migration.filePath);

    const mergedMigrationContent = {
        actions: merge(selectedMigrations.map((migration) => migration.content)),
        parent: firstMigration.content.parent,
    };

    if (dryRun) {
        console.info('Deleting the following migration files');
        console.info(selectedMigrationsFileNames);
    } else {
        await removeFiles(
            selectedMigrationsFileNames,
        );
    }

    const newFileName = lastMigration.file;
    if (dryRun) {
        console.info(`Creating migration file '${newFileName}'`);
        console.info(mergedMigrationContent);
    } else {
        await writeFilePromisify(
            newFileName,
            JSON.stringify(mergedMigrationContent, null, 4),
            'utf8',
        );
    }
}

export default mergeMigrations;
