import { isDefined, isNotDefined, listToGroupList, listToMap, mapToList } from '@togglecorp/fujs';
import xlsx from 'exceljs';
import { Language, ServerActionItem } from '../types';
import { Md5 } from 'ts-md5';
import { postLanguageStrings } from '../utils';

async function importExcel(importFilePath: string, apiUrl: string, accessToken: string) {
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
            const keyColumn = columnMap['key'];
            const key = isDefined(keyColumn) ? row.getCell(keyColumn).value?.toString() : undefined;

            const namespaceColumn = columnMap['namespace'];
            const namespace = isDefined(namespaceColumn) ? row.getCell(namespaceColumn).value?.toString() : undefined;

            if (isNotDefined(key) || isNotDefined(namespace)) {
                return;
            }

            const enColumn = columnMap['en'];
            const en = isDefined(enColumn) ? row.getCell(enColumn).value?.toString() : undefined;

            const arColumn = columnMap['ar'];
            const ar = isDefined(arColumn) ? row.getCell(arColumn).value?.toString() : undefined;

            const frColumn = columnMap['fr'];
            const fr = isDefined(frColumn) ? row.getCell(frColumn).value?.toString() : undefined;

            const esColumn = columnMap['es'];
            const es = isDefined(esColumn) ? row.getCell(esColumn).value?.toString() : undefined;

            if (isNotDefined(en)) {
                return;
            }

            const hash = Md5.hashStr(en);

            strings.push({
                key,
                namespace,
                language: 'en',
                value: en,
                hash,
            });

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

    const postPromises = languageGroupedActions.map(
        (languageStrings) => postLanguageStrings(
            languageStrings.language,
            languageStrings.actions,
            apiUrl,
            accessToken,
        )
    )

    await Promise.all(postPromises);
}

export default importExcel;
