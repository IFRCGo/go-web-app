import { compareString, isDefined, isNotDefined, isTruthyString, listToGroupList, listToMap, mapToList } from '@togglecorp/fujs';
import xlsx from 'exceljs';
import { Language, ServerActionItem, SourceStringItem, StringItem } from '../types';
import { Md5 } from 'ts-md5';
import { fetchAllServerStrings, postLanguageStrings, readFileAsync, writeFileAsync } from '../utils';
import stagingStrings from '../../../../../../go-temp/goadmin-stage.ifrc.org-1717130893109.json';

async function importExcel(
    importFilePath: string,
    apiUrl: string,
    accessToken: string,
) {
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

    const stringsFromExcel: StringItem[] = [];

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

            stringsFromExcel.push({
                namespace,
                key,
                language: 'en',
                value: en,
                hash,
            });

            if (isDefined(ar)) {
                stringsFromExcel.push({
                    namespace,
                    key,
                    language: 'ar',
                    value: ar,
                    hash,
                });
            }

            if (isDefined(fr)) {
                stringsFromExcel.push({
                    namespace,
                    key,
                    language: 'fr',
                    value: fr,
                    hash,
                });
            }

            if (isDefined(es)) {
                stringsFromExcel.push({
                    namespace,
                    key,
                    language: 'es',
                    value: es,
                    hash,
                });
            }
        }
    );

    const languageGroupedActions = mapToList(
        listToGroupList(
            stringsFromExcel,
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

    /*
    const postPromises = languageGroupedActions.map(
        (languageStrings) => postLanguageStrings(
            languageStrings.language,
            languageStrings.actions,
            apiUrl,
            accessToken,
        )
    )

    const postResponses = await Promise.all(postPromises);

    const postJsonResponses = await Promise.all(
        postResponses.map((response) => response.json())
    );
    */

    /*
    await writeFileAsync(
        'serverResponse.json',
        JSON.stringify(postJsonResponses, null, 2),
        'utf8',
    );
    */
}

export default importExcel;
