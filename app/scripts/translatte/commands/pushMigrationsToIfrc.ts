// NOTE: we are using sheetJS instead of excelJS here
// because for some reason excelJS cannot parse exports
// from IFRC translation service
import xlsx from 'xlsx';

import { getMigrationFilesAttrs, mergeMigrationActionItems, readMigrations, resolveUrl } from "../utils";
import { isDefined, isFalsyString, isNotDefined, isTruthyString, listToMap, mapToList } from '@togglecorp/fujs';
import { MigrationActionItem, MigrationFileContent } from '../types';

/*
export function isTranslatedTemplateValid(
    source: string,
    translation: string,
): boolean {
    const extract = (s: string): Set<string> => {
        const set = new Set<string>();
        const re = /\{([^{}]+)\}/g;
        let match: RegExpExecArray | null;

        while ((match = re.exec(s)) !== null) {
            const key = match[1].trim();
            if (key) set.add(key);
        }
        return set;
    };

    const sourceVars = extract(source);
    const translationVars = extract(translation);

    if (sourceVars.size !== translationVars.size) return false;

    for (const v of sourceVars) {
        if (!translationVars.has(v)) return false;
    }

    return true;
}
*/

async function fetchTranslations(ifrcApiUrl: string, ifrcApiKey: string, applicationId: string) {
    const endpoint = resolveUrl(ifrcApiUrl, `api/Application/${applicationId}/Translation/export`);

    const headers: RequestInit['headers'] = {
        // 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // 'Accept': 'application/octet-stream',
        'X-API-KEY': ifrcApiKey,
    }

    const promise = fetch(
        endpoint,
        {
            method: 'GET',
            headers,
        }
    );

    return promise;
}

async function pushTranslations(blob: Blob, ifrcApiUrl: string, ifrcApiKey: string, applicationId: string) {
    const endpoint = resolveUrl(ifrcApiUrl, `api/Application/${applicationId}/Translation/fullappimport`);

    console.info('posting to', endpoint);

    const formData = new FormData();
    formData.append('files', blob, 'translations.xlsx');

    const headers: RequestInit['headers'] = {
        'Accept': 'application/json',
        'X-API-KEY': ifrcApiKey,
    }

    const promise = fetch(
        endpoint,
        {
            method: 'POST',
            headers,
            body: formData,
        }
    );

    return promise;
}

type Translation = {
    page: string;
    key: string;
    en: string;
    fr: string  | undefined;
    es: string | undefined;
    ar: string | undefined;
}

function applyMigrationActions(
    translations: Translation[],
    migrationActions: MigrationFileContent['actions'],
): Translation[] {
    const translationsMap = listToMap(
        translations,
        (item) => getCombinedKey(item.page, item.key),
    );

    migrationActions.map((migration) => {
        const combinedKey = getCombinedKey(migration.namespace, migration.key);

        if (migration.action === 'remove') {
            delete translationsMap[combinedKey];
        } else if (migration.action === 'add') {
            const {
                key,
                namespace,
                value,
            } = migration;

            translationsMap[combinedKey] = {
                page: namespace,
                key,
                en: value,
                fr: undefined,
                es: undefined,
                ar: undefined,
            } satisfies Translation;
        } else {
            const {
                key,
                namespace,
                // value,
                newValue,
                newKey,
                newNamespace,
            } = migration;

            const oldTranslation = translationsMap[combinedKey];

            if (isTruthyString(newKey)) {
                if (isNotDefined(oldTranslation)) {
                    console.info(`Update key error: cannot find translation for ${combinedKey}`);
                    return;
                }

                const newCombinedKey = getCombinedKey(namespace, newKey);

                translationsMap[newCombinedKey] = {
                    ...oldTranslation,
                    key: newKey,
                    page: namespace,
                } satisfies Translation;

                delete translationsMap[combinedKey];
            } else if (isTruthyString(newNamespace)) {
                if (isNotDefined(oldTranslation)) {
                    console.info(`Update namespace error: cannot find translation for ${combinedKey}`);
                    return;
                }

                const newCombinedKey = getCombinedKey(newNamespace, key);
                translationsMap[newCombinedKey] = {
                    ...oldTranslation,
                    key,
                    page: newNamespace,
                } satisfies Translation;

                delete translationsMap[combinedKey];
            } else {
                if (isFalsyString(newValue)) {
                    console.info('Update value error: new value is not defined');
                    return;
                }

                translationsMap[combinedKey] = {
                    key,
                    page: namespace,
                    en: newValue,
                    fr: undefined,
                    es: undefined,
                    ar: undefined,
                } satisfies Translation;
            }
        }
    });

    return mapToList(translationsMap);
}

const META_PAGE_NAME = '__meta';
const LAST_MIGRATION_KEY_NAME = 'lastClientMigration';

function getCombinedKey(page: string, key: string) {
    return `${page}:${key}`;
}

async function pushMigrationsToIfrc(
    projectPath: string,
    migrationDirPath: string,
    apiUrl: string,
    apiKey: string,
    applicationId: string,
) {
    const migrationFilesAttrs = await getMigrationFilesAttrs(projectPath, migrationDirPath);

    const fetchResult = await fetchTranslations(apiUrl, apiKey, applicationId);
    const arrayBuffer = await fetchResult.arrayBuffer();
    const workbook= xlsx.read(arrayBuffer);
    const firstSheetData = xlsx.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
    ) as Partial<Translation>[] | undefined;

    const translations = firstSheetData?.map((row) => {
        const {
            page,
            key,
            en,
            fr,
            es,
            ar,
        } = row;

        if (isFalsyString(page) || isFalsyString(key) || isFalsyString(en)) {
            return undefined;
        }

        return {
            ...row,
            page,
            key,
            en,
            fr,
            es,
            ar,
        } satisfies Translation;
    }).filter(isDefined) ?? [];

    if (translations.length === 0) {
        console.info('Cannot find any translations in the server');
        // FIXME: the case for first upload is not handled here
        return;
    }

    const groupedTranslations = listToMap(
        translations ?? [],
        ({ page, key }) => getCombinedKey(page, key),
    );

    const lastMigrationCombinedKey = getCombinedKey(META_PAGE_NAME, LAST_MIGRATION_KEY_NAME);
    const lastMigrationName = groupedTranslations[lastMigrationCombinedKey]?.en;

    if (isFalsyString(lastMigrationName)) {
        console.info('Cannot find the last applied migration in the remote system!');
        return;
    }

    console.info('Last applied migration:', lastMigrationName);

    const attrIndex = migrationFilesAttrs.findIndex(
        ({ migrationName }) => migrationName === lastMigrationName,
    );

    if (attrIndex === -1) {
        console.info('Cannot find the last applied migration in local system!');
        return;
    }

    const remainingMigrationFilesAttr = migrationFilesAttrs.slice(attrIndex + 1);

    if (remainingMigrationFilesAttr.length === 0) {
        console.info('No migrations left to apply!');
        return;
    }

    console.info(`Found ${remainingMigrationFilesAttr.length} migrations to apply!`);

    const migrations = await readMigrations(
        remainingMigrationFilesAttr.map(({ filePath }) => filePath),
    );

    const migrationActions = migrations.reduce<MigrationActionItem[]>(
        (acc, migration) => (
            mergeMigrationActionItems(acc, migration.content.actions)
        ),
        [],
    );

    const newTranslations = applyMigrationActions(
        translations,
        migrationActions,
    );

    const newLatestMigrationName = remainingMigrationFilesAttr[remainingMigrationFilesAttr.length - 1].migrationName;

    const lastMigrationMetaIndex = newTranslations.findIndex(
        ({ page, key }) => getCombinedKey(page, key) === getCombinedKey(META_PAGE_NAME, LAST_MIGRATION_KEY_NAME)
    );

    const metaItem = {
        page: META_PAGE_NAME,
        key: LAST_MIGRATION_KEY_NAME,
        en: newLatestMigrationName,
        fr: undefined,
        es: undefined,
        ar: undefined,
    } satisfies Translation;

    if (lastMigrationMetaIndex === -1) {
        newTranslations.push(metaItem);
    } else {
        newTranslations.splice(lastMigrationMetaIndex, 1, metaItem);
    }

    const newWorksheet = xlsx.utils.json_to_sheet(newTranslations);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
        newWorkbook,
        newWorksheet,
        newLatestMigrationName,
    );

    const u8 = xlsx.write(newWorkbook, { bookType: 'xlsx', type: 'buffer' });
    const blob = new Blob([u8], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    const pushResult = await pushTranslations(blob, apiUrl, apiKey, applicationId);

    console.info(await pushResult.text());
}

export default pushMigrationsToIfrc;
