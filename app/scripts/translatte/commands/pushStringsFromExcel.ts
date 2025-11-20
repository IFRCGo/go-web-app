import xlsx, { CellValue } from 'exceljs';
import { Md5 } from 'ts-md5';
import { encodeDate, isDefined, isFalsyString, isNotDefined, listToGroupList, listToMap, mapToList } from '@togglecorp/fujs';

import { Language, ServerActionItem } from '../types';
import { postLanguageStrings, writeFilePromisify } from '../utils';

function getValueFromCellValue(cellValue: CellValue) {
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
    console.info(firstSheet.columnCount);

    const columns: {
        key: string;
        column: number | undefined;
    }[] = [];

    for (let i = 0; i < firstSheet.columnCount; i++) {
        const column = firstSheet.columns[i];
        const key = column.values?.[1]?.toString();

        if (isNotDefined(key)) {
            return;
        }

        columns.push({ key, column: column.number })
    }

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
        (row, i) => {
            if (i === 0) {
                return;
            }

            const keyColumn = columnMap['Key'];
            const key = isDefined(keyColumn) ? String(getValueFromCellValue(row.getCell(keyColumn).value)) : undefined;

            const namespaceColumn = columnMap['Namespace'];
            const namespace = isDefined(namespaceColumn) ? String(getValueFromCellValue(row.getCell(namespaceColumn).value)) : undefined;

            if (isFalsyString(key) || isFalsyString(namespace)) {
                return;
            }

            const enColumn = columnMap['EN'];
            const en = isDefined(enColumn) ? getValueFromCellValue(row.getCell(enColumn).value) : undefined;

            if (isFalsyString(en)) {
                return;
            }

            const arColumn = columnMap['AR'];
            const ar = isDefined(arColumn) ? getValueFromCellValue(row.getCell(arColumn).value) : undefined;

            const frColumn = columnMap['FR'];
            const fr = isDefined(frColumn) ? getValueFromCellValue(row.getCell(frColumn).value) : undefined;

            const esColumn = columnMap['ES'];
            const es = isDefined(esColumn) ? getValueFromCellValue(row.getCell(esColumn).value) : undefined;

            if (isNotDefined(en)) {
                return;
            }

            const hash = Md5.hashStr(String(en));

            strings.push({
                key,
                namespace,
                language: 'en',
                value: String(en),
                hash,
            });

            if (isDefined(fr)) {
                strings.push({
                    key,
                    namespace,
                    language: 'fr',
                    value: String(fr),
                    hash,
                });
            }


            if (isDefined(es)) {
                strings.push({
                    key,
                    namespace,
                    language: 'es',
                    value: String(es),
                    hash,
                });
            }

            if (isDefined(ar)) {
                strings.push({
                    key,
                    namespace,
                    language: 'ar',
                    value: String(ar),
                    hash,
                });
            }

        }
    );

    console.info(`Total ${strings.length} actions`);

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

    await writeFilePromisify(
        '/tmp/language-grouped-actions.json',
        JSON.stringify(languageGroupedActions, null, 2),
        'utf8',
    );

    for (let i = 0; i < languageGroupedActions.length; i++) {
        const action = languageGroupedActions[i];

        console.log(`posting ${action.language} actions...`);
        const result = await postLanguageStrings(
            action.language,
            action.actions,
            apiUrl,
            accessToken,
        );

        const resultJson = await result.text();
        console.info(resultJson);
    }
}

export default pushStringsFromExcel;
