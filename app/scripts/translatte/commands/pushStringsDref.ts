import xlsx, { CellValue } from 'exceljs';
import { fetchServerState, getTranslationFileNames, postLanguageStrings, readTranslations, writeFilePromisify } from "../utils";
import { encodeDate, isDefined, isFalsyString, isNotDefined, listToGroupList, listToMap, mapToList } from '@togglecorp/fujs';
import { Language, ServerActionItem, SourceStringItem } from '../types';
import { Md5 } from 'ts-md5';


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

function getCombinedKey(namespace: string, key: string) {
    return `${namespace}:${key}`;
}

async function createExcel(groupedStrings: Record<string, SourceStringItem[]>) {
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
    ];

    Object.values(groupedStrings).map((translations) => {
        const translationByLang = listToMap(
            translations,
            ({ language }) => language,
        );

        if (isFalsyString(translationByLang.en)) {
            console.info(JSON.stringify(translationByLang, null, 2));
        } else {
            worksheet.addRow({
                namespace: translationByLang.en.page_name,
                key: translationByLang.en.key,
                en: translationByLang.en.value,
                fr: translationByLang.fr?.value,
                es: translationByLang.es?.value,
                ar: translationByLang.ar?.value,
            });
        }
    });

    const fileName = `go-dref-updated-strings-${yyyy}-${mm}-${dd}`;

    await workbook.xlsx.writeFile(`${fileName}.xlsx`);
}

async function pushStringsDref(
    projectPath: string,
    importFilePath: string,
    translationFileNames: string[],
    apiUrl: string,
    accessToken: string,
) {
    const serverState = await fetchServerState(apiUrl);

    const groupedServerStateMapping = listToGroupList(
        serverState,
        ({ page_name, key }) => getCombinedKey(page_name, key),
    );

    const serverEnStringItems = serverState.filter((string) => string.language === 'en');

    const translationFiles = await getTranslationFileNames(
        projectPath,
        Array.isArray(translationFileNames) ? translationFileNames : [translationFileNames],
    );
    const { translations } = await readTranslations(translationFiles);
    const fileState = translations.map((item) => ({
        ...item,
    }));

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

    firstSheet.eachRow((row, i) => {
        if (i === 0) {
            return;
        }

        const enColumnKey = columnMap['EN'];
        const frColumnKey = columnMap['FR'];
        const esColumnKey = columnMap['ES'];
        const arColumnKey = columnMap['AR'];

        const enValue = isDefined(enColumnKey) ? getValueFromCellValue(row.getCell(enColumnKey).value) : undefined;
        const frValue = isDefined(frColumnKey) ? getValueFromCellValue(row.getCell(frColumnKey).value) : undefined;
        const esValue = isDefined(esColumnKey) ? getValueFromCellValue(row.getCell(esColumnKey).value) : undefined;
        const arValue = isDefined(arColumnKey) ? getValueFromCellValue(row.getCell(arColumnKey).value) : undefined;

        const serverMatchedStrings = serverEnStringItems.filter(({ value }) => value === enValue);

        serverMatchedStrings.forEach((matchedItem) => {
            const combinedKey = getCombinedKey(matchedItem.page_name, matchedItem.key);

            groupedServerStateMapping[combinedKey] = groupedServerStateMapping[combinedKey].map((translationItem) => {
                if (translationItem.language === 'fr') {
                    return {
                        ...matchedItem,
                        language: 'fr',
                        value: String(frValue),
                    }
                }

                if (translationItem.language === 'es') {
                    return {
                        ...matchedItem,
                        language: 'es',
                        value: String(esValue),
                    }
                }

                if (translationItem.language === 'ar') {
                    return {
                        ...matchedItem,
                        language: 'ar',
                        value: String(esValue),
                    }
                }

                return translationItem;
            });

            updatedStrings.push({
                ...matchedItem,
                language: 'fr',
                value: String(frValue),
            });

            updatedStrings.push({
                ...matchedItem,
                language: 'es',
                value: String(esValue),
            });

            updatedStrings.push({
                ...matchedItem,
                language: 'ar',
                value: String(arValue),
            });
        });

        const serverMatchedStringsMapping = listToMap(
            serverMatchedStrings,
            ({ key, page_name }) => getCombinedKey(page_name, key),
            () => true,
        );

        const fileMatchedEnStrings = fileState.filter(
            ({ value, key, namespace }) => value === enValue && !serverMatchedStringsMapping[getCombinedKey(namespace, key)]
        );

        fileMatchedEnStrings.forEach((matchedItem) => {
            const hash = Md5.hashStr(matchedItem.value);
            const combinedKey = getCombinedKey(matchedItem.namespace, matchedItem.key);

            groupedServerStateMapping[combinedKey] = [
                {
                    key: matchedItem.key,
                    page_name: matchedItem.namespace,
                    hash,
                    language: 'en',
                    value: matchedItem.value,
                },
                {
                    key: matchedItem.key,
                    page_name: matchedItem.namespace,
                    hash,
                    language: 'fr',
                    value: String(frValue),
                },
                {
                    key: matchedItem.key,
                    page_name: matchedItem.namespace,
                    hash,
                    language: 'es',
                    value: String(esValue),
                },
                {
                    key: matchedItem.key,
                    page_name: matchedItem.namespace,
                    hash,
                    language: 'ar',
                    value: String(arValue),
                },
            ];


            updatedStrings.push({
                key: matchedItem.key,
                page_name: matchedItem.namespace,
                hash,
                language: 'en',
                value: matchedItem.value,
            });

            updatedStrings.push({
                key: matchedItem.key,
                page_name: matchedItem.namespace,
                hash,
                language: 'fr',
                value: String(frValue),
            });

            updatedStrings.push({
                key: matchedItem.key,
                page_name: matchedItem.namespace,
                hash,
                language: 'es',
                value: String(esValue),
            });

            updatedStrings.push({
                key: matchedItem.key,
                page_name: matchedItem.namespace,
                hash,
                language: 'ar',
                value: String(arValue),
            });
        });
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

    await createExcel(groupedServerStateMapping);

    /*
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
        await writeFilePromisify(
            `/tmp/push-${action.language}-strings-dref-logs.json`,
            JSON.stringify(resultJson, null, 2),
            'utf8',
        );
    }
    */
}

export default pushStringsDref;
