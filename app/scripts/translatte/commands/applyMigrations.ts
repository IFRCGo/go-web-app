import { Md5 } from 'ts-md5';
import { listToMap, isDefined, unique } from '@togglecorp/fujs';
import { basename } from 'path';
import {
    readJsonSource,
    readMigrations,
    writeFileAsync,
    getMigrationFilesAttrsFromDir,
} from '../utils';
import { merge } from './mergeMigrations';
import {
    SourceFileContent,
    MigrationFileContent,
    SourceStringItem,
} from '../types';

function apply(
    strings: SourceStringItem[],
    migrationActions: MigrationFileContent['actions'],
    languages: string[],
): SourceStringItem[] {
    const stringsMapping = listToMap(
        strings,
        (item) => `${item.page_name}:${item.key}:${item.language}` as string,
        (item) => item,
    );

    const newMapping: {
        [key: string]: SourceStringItem | null;
    } = { };

    unique(['en', ...languages]).forEach((language) => {
        migrationActions.forEach((action) => {
            const isSourceLanguage = language === 'en';
            const key = `${action.namespace}:${action.key}:${language}`;
            if (action.action === 'add') {
                const hash = Md5.hashStr(action.value);

                const prevValue = stringsMapping[key];
                // NOTE: we are comparing hash instead of value so that this works for source language as well as other languages
                if (prevValue && prevValue.hash !== hash) {
                    // console.info(prevValue, action);
                    // throw `Add: We already have string with different value for namespace '${action.namespace}' and key '${action.key}'`;
                    console.info(`Add: We already have string with different value for namespace '${action.namespace}' and key '${action.key}'`);
                }

                if (newMapping[key]) {
                    console.info(prevValue, action, newMapping);
                    throw `Add: We already have string for namespace '${action.namespace}' and key '${action.key}' in migration`;
                }

                newMapping[key] = {
                    hash,
                    key: action.key,
                    page_name: action.namespace,
                    language,
                    value: isSourceLanguage
                        ? action.value
                        : '',
                };
            } else if (action.action === 'remove') {
                // NOTE: We can add or move string so we might have value in newMapping
                if (!newMapping[key]) {
                    newMapping[key] = null;
                }
            } else {
                const prevValue = stringsMapping[key];
                if (!prevValue) {
                    throw `Update: We do not have string with namespace '${action.namespace}' and key '${action.key}'`;
                }

                const newKey = action.newKey ?? prevValue.key;
                const newNamespace = action.newNamespace ?? prevValue.page_name;
                const newValue = isSourceLanguage
                    ? action.newValue ?? prevValue.value
                    : prevValue.value;
                const newHash = isSourceLanguage
                    ? Md5.hashStr(newValue)
                    : prevValue.hash;

                const newCanonicalKey = `${newNamespace}:${newKey}:${language}`;


                // NOTE: remove the old key and add new key
                if (!newMapping[key]) {
                    newMapping[key] = null;
                }

                const newItem = {
                    hash: newHash,
                    key: newKey,
                    page_name: newNamespace,
                    language,
                    value: newValue,
                }

                if (newMapping[newCanonicalKey]) {
                    throw `Update: We already have string for namespace '${action.namespace}' and key '${action.key}' in migration`;
                }
                newMapping[newCanonicalKey] = newItem;
            }
        });
    });

    const finalMapping: typeof newMapping = {
        ...stringsMapping,
        ...newMapping,
    };

    return Object.values(finalMapping)
        .filter(isDefined)
        .sort((foo, bar) => (
            foo.page_name.localeCompare(bar.page_name)
            || foo.key.localeCompare(bar.key)
            || foo.language.localeCompare(bar.language)
        ))
}

async function applyMigrations(
    migrationDir: string,
    sourceFilePath: string,
    destinationFileName: string,
    languages: string[],
    from: string | undefined,
    dryRun: boolean | undefined,
) {
    const sourceFile = await readJsonSource(sourceFilePath)

    const migrationFilesAttrs = await getMigrationFilesAttrsFromDir(migrationDir);
    const selectedMigrationFilesAttrs = from
        ? migrationFilesAttrs.filter((item) => (item.migrationName > from))
        : migrationFilesAttrs;

    console.info(`Found ${selectedMigrationFilesAttrs.length} migration files`);

    if (selectedMigrationFilesAttrs.length < 1) {
        throw 'There should be atleast 1 migration file';
    }

    const selectedMigrations = await readMigrations(
        selectedMigrationFilesAttrs.map((migration) => migration.fileName),
    );

    const lastMigration = selectedMigrations[selectedMigrations.length - 1];

    const mergedMigrationActions = merge(
        selectedMigrations.map((migration) => migration.content),
    );

    const outputSourceFileContent: SourceFileContent = {
        // ...sourceFile.content,
        last_migration: basename(lastMigration.file),
        strings: apply(
            sourceFile.content.filter(
                ({ page_name }) => isDefined(page_name)
            ),
            mergedMigrationActions,
            languages,
        ),
    };

    if (dryRun) {
        console.info(`Creating file '${destinationFileName}'`);
        console.info(outputSourceFileContent);
    } else {
        await writeFileAsync(
            destinationFileName,
            JSON.stringify(outputSourceFileContent, null, 4),
            'utf8',
        );
    }
}

export default applyMigrations;
