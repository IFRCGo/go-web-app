import xlsx from 'exceljs';

import { readMigrations } from '../utils';
import { isNotDefined } from '@togglecorp/fujs';

async function exportMigration(
    migrationFilePath: string,
    exportFileName: string,
) {
    const migrations = await readMigrations(
        [migrationFilePath]
    );

    const actions = migrations[0].content.actions;
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

    actions.forEach((actionItem) => {
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

    const fileName = isNotDefined(exportFileName)
        ? `go-strings-${yyyy}-${mm}-${dd}`
        : exportFileName;

    await workbook.xlsx.writeFile(`${fileName}.xlsx`);
}

export default exportMigration;
