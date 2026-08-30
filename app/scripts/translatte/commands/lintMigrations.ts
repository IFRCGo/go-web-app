import { listToGroupList } from '@togglecorp/fujs';
import { getMigrationFilesAttrs } from '../utils';

async function lintMigrations(projectPath: string, path: string) {
    const migrationFileAttrs = await getMigrationFilesAttrs(projectPath, path);
    console.info(`Found ${migrationFileAttrs.length} migration files.`);

    // Group by `num` (the leading NNNNNN), not the full name: two branches
    // each generating the next number produce diverging same-numbered migrations.
    const migrationGroups = listToGroupList(
        migrationFileAttrs,
        ({ num }) => num,
    );

    const duplicates = Object.values(migrationGroups).filter((group) => group.length > 1);

    if (duplicates.length > 0) {
        const duplicateStr = duplicates.map((duplicate) => (
            duplicate.map(({ migrationFileName }) => migrationFileName).join(' <> ')
        )).join('\n');

        console.info(duplicateStr);

        throw `Error: found migrations with duplicate numbers!`;
    }

    console.info('All good! No diverging migrations!');
}

export default lintMigrations;
