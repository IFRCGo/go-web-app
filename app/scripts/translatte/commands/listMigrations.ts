import { getMigrationFilesAttrs } from '../utils';

async function listMigrations(projectPath: string, path: string) {
    const migrationFileAttrs = await getMigrationFilesAttrs(projectPath, path);
    console.info(`Found ${migrationFileAttrs.length} migration files.`);
    if (migrationFileAttrs.length > 0) {
        console.info(migrationFileAttrs);
    }
}

export default listMigrations;
