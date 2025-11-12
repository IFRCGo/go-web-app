import xlsx, { CellValue } from 'exceljs';
import { fetchServerState, postLanguageStrings } from "../utils";
import { encodeDate, isDefined, isNotDefined, listToGroupList, listToMap, mapToList } from '@togglecorp/fujs';
import { Language, ServerActionItem, SourceStringItem } from '../types';


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

async function pushStringsDref(importFilePath: string, apiUrl: string, accessToken: string) {
    const strings = await fetchServerState(apiUrl);
    const enStrings = strings.filter((string) => string.language === 'en');

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

    const updatedStrings: SourceStringItem[] = [];

    firstSheet.eachRow((row) => {
        const enColumnKey = columnMap['EN'];
        const frColumnKey = columnMap['FR'];
        const esColumnKey = columnMap['ES'];
        const arColumnKey = columnMap['AR'];

        const enValue = isDefined(enColumnKey) ? getValueFromCellValue(row.getCell(enColumnKey).value) : undefined;

        const string = enStrings.find(({ value }) => value === enValue);

        if (string) {
            const frValue = isDefined(frColumnKey) ? getValueFromCellValue(row.getCell(frColumnKey).value) : undefined;
            const esValue = isDefined(esColumnKey) ? getValueFromCellValue(row.getCell(esColumnKey).value) : undefined;
            const arValue = isDefined(arColumnKey) ? getValueFromCellValue(row.getCell(arColumnKey).value) : undefined;

            updatedStrings.push({
                ...string,
                language: 'fr',
                value: String(frValue),
            });

            updatedStrings.push({
                ...string,
                language: 'es',
                value: String(esValue),
            });

            updatedStrings.push({
                ...string,
                language: 'ar',
                value: String(arValue),
            });
        }
    });

    const languageGroupedActions = mapToList(
        listToGroupList(
            updatedStrings,
            ({ language }) => language,
            (languageString) => {
                const serverAction: ServerActionItem = {
                    action: 'set',
                    key: languageString.key,
                    page_name: languageString.page_name,
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
        const action = languageGroupedActions[i];

        console.log(`posting ${action.language} actions...`);
        const result = await postLanguageStrings(
            action.language,
            action.actions,
            apiUrl,
            accessToken,
        )

        const resultJson = await result.json();
        console.info(resultJson);
    }
}

export default pushStringsDref;
