import xlsx, { CellValue, Row } from 'exceljs';
import { Md5 } from 'ts-md5';
import { encodeDate, isDefined, isFalsyString, isNotDefined, listToMap } from '@togglecorp/fujs';

import { Language, ServerActionItem } from '../types';
import { postLanguageStrings, writeFilePromisify } from '../utils';

type Translation = {
    key: string;
    namespace: string;
    en: string;
    fr: string | undefined;
    es: string | undefined;
    ar: string | undefined;
    hash: string;
}

function resolveCellValue(cellValue: CellValue) {
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
    return resolveCellValue(cellValue.result);
}

function getStringValueFromCellValue(cellValue: CellValue | undefined) {
    if (isNotDefined(cellValue)) {
        return undefined;
    }

    const resolvedValue = resolveCellValue(cellValue);

    if (isNotDefined(resolvedValue)) {
        return undefined;
    }

    const stringValue = String(resolvedValue);

    if (isFalsyString(stringValue.trim())) {
        return undefined;
    }

    return stringValue;
}

function getCellValueFromRow(row: Row, columnIndex: number | undefined) {
    if (isNotDefined(row) || isNotDefined(columnIndex)) {
        return undefined;
    }

    const cellValue = row.getCell(columnIndex).value;

    return getStringValueFromCellValue(cellValue);
}

async function getExcelTranslations(excelFilePath: string) {
    const workbook = new xlsx.Workbook();
    await workbook.xlsx.readFile(excelFilePath);

    const firstSheet = workbook.worksheets[0];

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

        columns.push({
            key: key.toLowerCase(),
            column: column.number,
        })
    }

    const columnMap = listToMap(
        columns,
        ({ key }) => key,
        ({ column }) => column,
    );

    // Remove header row
    firstSheet.spliceRows(1, 1);

    const KEY = 'key';
    const NAMESPACE = 'namespace';
    const EN = 'en';
    const FR = 'fr';
    const ES = 'es';
    const AR = 'ar';

    const translations: Translation[] = [];

    firstSheet.eachRow((row) => {
        const key = getCellValueFromRow(row, columnMap[KEY]);
        const namespace = getCellValueFromRow(row, columnMap[NAMESPACE]);

        if (isFalsyString(key) || isFalsyString(namespace)) {
            return;
        }

        const en = getCellValueFromRow(row, columnMap[EN]);

        if (isFalsyString(en)) {
            return;
        }

        const fr = getCellValueFromRow(row, columnMap[FR]);
        const es = getCellValueFromRow(row, columnMap[ES]);
        const ar = getCellValueFromRow(row, columnMap[AR]);

        const hash = Md5.hashStr(String(en));

        translations.push({
            key,
            namespace,
            en,
            fr,
            es,
            ar,
            hash,
        });
    });

    return translations;
}

async function pushStringsFromExcel(importFilePath: string, apiUrl: string, accessToken: string) {
    const translations = await getExcelTranslations(importFilePath);

    if (isNotDefined(translations)) {
        console.info('Could not process the given excel file', importFilePath);
        return;
    }

    console.info(`Found ${translations.length} rows`);

    const applicableLanguages: Language[] = ['en', 'fr', 'es', 'ar'];

    const actionsByLanugage = listToMap(
        applicableLanguages,
        (lang) => lang,
        (lang) => translations.map((translation) => {
            const languageValue = translation[lang];

            if (isNotDefined(languageValue)) {
                return undefined;
            }

            return {
                action: 'set',
                key: translation.key,
                page_name: translation.namespace,
                value: languageValue,
                hash: translation.hash,
            } satisfies ServerActionItem;
        }).filter(isDefined),
    );

    for (let i = 0; i < applicableLanguages.length; i++) {
        const language = applicableLanguages[i];
        const actions = actionsByLanugage[language];

        if (actions.length > 0) {
            console.log(`posting ${actions.length} ${language} actions...`);
            const result = await postLanguageStrings(
                language,
                actions,
                apiUrl,
                accessToken,
            );

            try {
                const resultJson = await result.json();

                await writeFilePromisify(
                    '/tmp/push-strings-from-excel-response-${language}.json',
                    JSON.stringify(resultJson, null, 2),
                    'utf8',
                );
            } catch {
                const resultText = await result.text();

                await writeFilePromisify(
                    '/tmp/push-strings-from-excel-response-${language}.log',
                    JSON.stringify(resultText, null, 2),
                    'utf8',
                );
            }
        }
    }
}

export default pushStringsFromExcel;
