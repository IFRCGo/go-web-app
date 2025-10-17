import xlsx from 'exceljs';
import { Md5 } from 'ts-md5';
import { encodeDate, isDefined, isNotDefined, listToGroupList, listToMap, mapToList } from '@togglecorp/fujs';

import { Language, ServerActionItem } from '../types';
import { postLanguageStrings } from '../utils';

function getValueFromCellValue(cellValue: xlsx.CellValue) {
    if (isNotDefined(cellValue)) {
        return undefined;
    }

    if (
        typeof cellValue === 'number'
        || typeof cellValue === 'string'
        || typeof cellValue === 'boolean'
    ) {
        return cellValue;
    }

    if (cellValue instanceof Date) {
        return encodeDate(cellValue);
    }

    if ('error' in cellValue) {
        return undefined;
    }

    if ('richText' in cellValue) {
        return cellValue.richText.map(({ text }) => text).join('');
    }

    if ('hyperlink' in cellValue) {
        const MAIL_IDENTIFIER = 'mailto:';
        if (cellValue.hyperlink.startsWith(MAIL_IDENTIFIER)) {
            return cellValue.hyperlink.substring(MAIL_IDENTIFIER.length);
        }

        return cellValue.hyperlink;
    }

    if (isNotDefined(cellValue.result)) {
        return undefined;
    }

    if (typeof cellValue.result === 'object' && 'error' in cellValue.result) {
        return undefined;
    }

    // Formula result
    return getValueFromCellValue(cellValue.result);
}

async function pushStringsFromExcel(importFilePath: string, apiUrl: string, accessToken: string) {
    const workbook = new xlsx.Workbook();

    await workbook.xlsx.readFile(importFilePath);

    const firstSheet = workbook.worksheets[0];
    const columns = firstSheet.columns.map(
        (column) => {
            const key = column.values?.[1]?.toString();
            if (isNotDefined(key)) {
                return undefined;
            }
            return { key, column: column.number }
        }
    ).filter(isDefined);

    const columnMap = listToMap(
        columns,
        ({ key }) => key,
        ({ column }) => column,
    );

    const strings: {
        key: string;
        namespace: string;
        language: Language;
        value: string;
        hash: string;
    }[] = [];

    firstSheet.eachRow(
        (row) => {
            const keyColumn = columnMap['Key'];
            const key = isDefined(keyColumn) ? row.getCell(keyColumn).value?.toString() : undefined;

            const namespaceColumn = columnMap['Namespace'];
            const namespace = isDefined(namespaceColumn) ? row.getCell(namespaceColumn).value?.toString() : undefined;

            if (isNotDefined(key) || isNotDefined(namespace)) {
                return;
            }

            const enColumn = columnMap['EN'];
            const en = isDefined(enColumn)
                ? String(getValueFromCellValue(row.getCell(enColumn).value))
                : undefined;

            const arColumn = columnMap['AR'];
            const ar = isDefined(arColumn)
                ? String(getValueFromCellValue(row.getCell(arColumn).value))
                : undefined;

            const frColumn = columnMap['FR'];
            const fr = isDefined(frColumn)
                ? String(getValueFromCellValue(row.getCell(frColumn).value))
                : undefined;

            const esColumn = columnMap['ES'];
            const es = isDefined(esColumn)
                ? String(getValueFromCellValue(row.getCell(esColumn).value))
                : undefined;

            if (isNotDefined(en)) {
                return;
            }

            const hash = Md5.hashStr(en);

            /*
            strings.push({
                key,
                namespace,
                language: 'en',
                value: en,
                hash,
            });
            */

            if (isDefined(ar)) {
                strings.push({
                    key,
                    namespace,
                    language: 'ar',
                    value: ar,
                hash,
                });
            }

            if (isDefined(fr)) {
                strings.push({
                    key,
                    namespace,
                    language: 'fr',
                    value: fr,
                    hash,
                });
            }

            if (isDefined(es)) {
                strings.push({
                    key,
                    namespace,
                    language: 'es',
                    value: es,
                    hash,
                });
            }
        }
    );

    const languageGroupedActions = mapToList(
        listToGroupList(
            strings,
            ({ language }) => language,
            (languageString) => {
                const serverAction: ServerActionItem = {
                    action: 'set',
                    key: languageString.key,
                    page_name: languageString.namespace,
                    value: languageString.value,
                    hash: languageString.hash,
                }

                return serverAction;
            },
        ),
        (actions, language) => ({
            language: language as Language,
            actions,
        })
    );

    for (let i = 0; i < languageGroupedActions.length; i++) {
        const languageStrings = languageGroupedActions[i];

        console.info('posting for', languageStrings.language);
        const response = await postLanguageStrings(
            languageStrings.language,
            languageStrings.actions,
            apiUrl,
            accessToken,
        )

        const responseText = await response.text();
        console.info('response', responseText);
    }
}

export default pushStringsFromExcel;
