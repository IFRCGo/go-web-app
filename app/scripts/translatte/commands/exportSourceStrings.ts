import xlsx from 'exceljs';

import { getTranslationFileNames, readTranslations } from "../utils";

async function exportSourceStrings(
    projectPath: string,
    translationFileName: string | string[],
) {
    const translationFiles = await getTranslationFileNames(
        projectPath,
        Array.isArray(translationFileName) ? translationFileName : [translationFileName],
    );
    const { translations } = await readTranslations(translationFiles);

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
    ]

    translations.forEach((translation) => {
        worksheet.addRow({
            namespace: translation.namespace,
            key: translation.key,
            en: translation.value,
        })
    })

    const fileName = `go-source-strings-${yyyy}-${mm}-${dd}`

    await workbook.xlsx.writeFile(`${fileName}.xlsx`);
}

export default exportSourceStrings;

