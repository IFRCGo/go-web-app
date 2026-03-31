import xlsx from 'exceljs';

import { fetchServerState } from "../utils";
import { isFalsyString, listToGroupList, listToMap, mapToList } from '@togglecorp/fujs';

async function exportServerStringsToExcel(
    apiUrl: string,
    authToken?: string,
    exportFileName?: string,
) {
    const serverStrings = await fetchServerState(apiUrl, authToken);

    const workbook = new xlsx.Workbook();
    const now = new Date();
    workbook.created = now;

    const yyyy = now.getFullYear();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const HH = now.getHours().toString().padStart(2, '0');
    const MM = now.getMinutes().toString().padStart(2, '0');

    const worksheet = workbook.addWorksheet(
        `${yyyy}-${mm}-${dd} ${HH}-${MM}`
    );

    worksheet.columns = [
        { header: 'Namespace', key: 'namespace' },
        { header: 'Key', key: 'key' },
        { header: 'EN', key: 'en' },
        { header: 'FR', key: 'fr' },
        { header: 'ES', key: 'es' },
        { header: 'AR', key: 'ar' },
    ]

    const keyGroupedStrings = mapToList(
        listToGroupList(
            serverStrings,
            ({ page_name, key }) => `${page_name}:${key}`,
        ),
        (list) => {
            const value = listToMap(
                list,
                ({ language }) => language,
                ({ value }) => value
            );
            const hash = listToMap(
                list,
                ({ language }) => language,
                ({ hash }) => hash,
            );
            const { key, page_name } = list[0];

            return {
                namespace: page_name,
                key: key,
                en: value.en,
                fr: hash.fr === hash.en ? value.fr : undefined,
                es: hash.es === hash.en ? value.es : undefined,
                ar: hash.ar === hash.en ? value.ar : undefined,
            };
        },
    );

    Object.values(keyGroupedStrings).forEach((keyGroupedString) => {
        worksheet.addRow(keyGroupedString);
    });

    const fileName = isFalsyString(exportFileName)
        ? `go-server-strings-${yyyy}-${mm}-${dd}`
        : exportFileName;

    await workbook.xlsx.writeFile(`${fileName}.xlsx`);
}

export default exportServerStringsToExcel;
