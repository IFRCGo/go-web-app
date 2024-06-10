import xlsx from 'exceljs';

import { getMigrationFilesAttrs, readMigrations } from '../utils';
import { isNotDefined } from '@togglecorp/fujs';
import { merge } from './mergeMigrations';
import { join } from 'path';

async function exportMigration(
    migrationDir: string,
    lastAppliedMigration: string,
    outputDir: string,
) {
    const migrationFilesAttrs = await getMigrationFilesAttrs('', migrationDir);
    const selectedMigrationFilesAttrs = lastAppliedMigration
        ? migrationFilesAttrs.filter((item) => (item.migrationName > lastAppliedMigration))
        : migrationFilesAttrs;

    console.info(`Found ${selectedMigrationFilesAttrs.length} migration files`);

    if (selectedMigrationFilesAttrs.length < 1) {
        throw 'There should be atleast 1 migration file';
    }

    const selectedMigrations = await readMigrations(
        selectedMigrationFilesAttrs.map((migration) => migration.fileName),
    );

    const mergedMigrationActions = merge(
        selectedMigrations.map((migration) => migration.content),
    );

    const workbook = new xlsx.Workbook();
    const now = new Date();
    workbook.created = now;

    const yyyy = now.getFullYear();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const worksheet = workbook.addWorksheet(
        `${yyyy}-${mm}-${dd}`
    );

    worksheet.columns = [
        { header: 'Namespace', key: 'namespace' },
        { header: 'Key', key: 'key' },
        { header: 'EN', key: 'en' },
        { header: 'FR', key: 'fr' },
        { header: 'ES', key: 'es' },
        { header: 'AR', key: 'ar' },
    ]

    mergedMigrationActions.forEach((actionItem) => {
        if (actionItem.action === 'remove') {
            return;
        }

        if (actionItem.action === 'update' && isNotDefined(actionItem.newValue)) {
            return;
        }

        const value = actionItem.action === 'update'
            ? actionItem.newValue
            : actionItem.value;

        worksheet.addRow({
            namespace: actionItem.namespace,
            key: actionItem.key,
            en: value,
        });
    });

    const firstMigrationNum = selectedMigrationFilesAttrs[0].num;
    const lastMigrationNum = selectedMigrationFilesAttrs[selectedMigrationFilesAttrs.length - 1].num;

    const fileNum = firstMigrationNum === lastMigrationNum
        ? firstMigrationNum
        : `${firstMigrationNum}-${lastMigrationNum}`;

    const fileName = `go-strings-${fileNum}.xlsx`;

    await workbook.xlsx.writeFile(join(outputDir, fileName));
}

export default exportMigration;
