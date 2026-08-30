import xlsx from 'xlsx';
import { Md5 } from 'ts-md5';
import { compareString, isFalsyString, isNotDefined, isTruthyString, listToGroupList, listToMap, mapToList } from "@togglecorp/fujs";
import { fetchServerState, getMigrationFilesAttrs, mergeMigrationActionItems, readMigrations } from "../utils";
import { MigrationActionItem, MigrationFileContent } from "../types";

type Translation = {
    page: string;
    key: string;
    en: string;
    hash: string;
    fr: string  | undefined;
    es: string | undefined;
    ar: string | undefined;
}

const META_PAGE_NAME = '__meta';
const LAST_MIGRATION_KEY_NAME = 'lastClientMigration';

function getCombinedKey(page: string, key: string) {
    return `${page}:${key}`;
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

            const hash = Md5.hashStr(value);

            translationsMap[combinedKey] = {
                page: namespace,
                key,
                en: value,
                hash,
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

                const hash = Md5.hashStr(newValue);

                translationsMap[combinedKey] = {
                    key,
                    page: namespace,
                    en: newValue,
                    hash,
                    fr: undefined,
                    es: undefined,
                    ar: undefined,
                } satisfies Translation;
            }
        }
    });

    return mapToList(translationsMap);
}

async function pushMigrationsToGo(
    projectPath: string,
    migrationDirPath: string,
    apiUrl: string,
    authToken: string,
) {
    const migrationFilesAttrs = await getMigrationFilesAttrs(projectPath, migrationDirPath);

    const serverState = await fetchServerState(apiUrl);

    const translations: Translation[] = Object.values(
        listToGroupList(
            serverState,
            ({ page_name, key }) => getCombinedKey(page_name, key),
            undefined,
            (groupedList) => {
                const languageMappedStrings = listToMap(
                    groupedList,
                    ({ language }) => language,
                );

                return {
                    page: languageMappedStrings.en.page_name,
                    key: languageMappedStrings.en.key,
                    en: languageMappedStrings.en.value,
                    hash: languageMappedStrings.en.hash,
                    fr: languageMappedStrings.fr?.value,
                    es: languageMappedStrings.es?.value,
                    ar: languageMappedStrings.ar?.value,
                } satisfies Translation
            }
        ),
    );

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

    console.info(`Applying ${migrationActions.length} actions`);

    const newTranslations = applyMigrationActions(
        translations,
        migrationActions,
    );

    newTranslations.sort((a, b) => {
        return compareString(a.page, b.page) || compareString(a.key, b.key);
    });

    const newLatestMigrationName = remainingMigrationFilesAttr[remainingMigrationFilesAttr.length - 1].migrationName;

    const lastMigrationMetaKeyIndex = newTranslations.findIndex((translation) => (
        getCombinedKey(translation.page, translation.key) === lastMigrationCombinedKey
    ));

    const lastMigrationMetaItem: Translation = {
        page: META_PAGE_NAME,
        key: LAST_MIGRATION_KEY_NAME,
        en: newLatestMigrationName,
        hash: newLatestMigrationName,
        fr: undefined,
        es: undefined,
        ar: undefined,
    }

    if (lastMigrationMetaKeyIndex=== -1) {
        newTranslations.unshift(lastMigrationMetaItem);
    } else {
        newTranslations.splice(lastMigrationMetaKeyIndex, 1, lastMigrationMetaItem);
    }

    const newWorksheet = xlsx.utils.json_to_sheet(newTranslations.map((translation) => ({
        namespace: translation.page,
        key: translation.key,
        en: translation.en,
        fr: translation.fr,
        es: translation.es,
        ar: translation.ar,
    })));
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
        newWorkbook,
        newWorksheet,
        newLatestMigrationName,
    );

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const HH = now.getHours().toString().padStart(2, '0');
    const MM = now.getMinutes().toString().padStart(2, '0');

    const fileName = `migrated-strings-${newLatestMigrationName}--${yyyy}-${mm}-${dd}--${HH}-${MM}.xlsx`;
    console.info(`Writing to ${fileName}`);

    await xlsx.writeFile(newWorkbook, fileName);
}

export default pushMigrationsToGo;
