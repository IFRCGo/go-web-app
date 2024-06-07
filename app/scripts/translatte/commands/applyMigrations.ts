import { Md5 } from 'ts-md5';
import { listToMap, isDefined, unique } from '@togglecorp/fujs';
import { isAbsolute, join } from 'path';
import {
    readSource,
    getMigrationFilesAttrs,
    readMigrations,
    writeFilePromisify,
} from '../utils';
import {
    SourceFileContent,
    MigrationFileContent,
    SourceStringItem,
} from '../types';

function apply(
    strings: SourceStringItem[],
    stringsFromServer: SourceStringItem[],
    migrationActions: MigrationFileContent['actions'],
    languages: string[],
): SourceStringItem[] {
    const stringsMappingFromServer = listToMap(
        stringsFromServer,
        (item) => `${item.page_name}:${item.key}:${item.language}` as string,
        (item) => item,
    );
    const stringsMapping = listToMap(
        strings,
        (item) => `${item.page_name}:${item.key}:${item.language}` as string,
        (item) => item,
    );

    const newMapping: {
        [key: string]: SourceStringItem | null;
    } = {};

    unique(['en', ...languages]).forEach((language) => {
        migrationActions.forEach((action) => {
            const isSourceLanguage = language === 'en';
            const key = `${action.namespace}:${action.key}:${language}`;
            if (action.action === 'add') {
                const hash = Md5.hashStr(action.value);

                if (!isSourceLanguage) {
                    // NOTE: We do not need to add strings for other languages, just copy it
                    const prevValueFromServer = stringsMappingFromServer[key];
                    if (prevValueFromServer) {
                        newMapping[key] = {
                            page_name: action.namespace,
                            key: action.key,
                            language,
                            value: prevValueFromServer.value,
                            hash: prevValueFromServer.hash,
                        };
                    }
                    return;
                }

                const prevValue = stringsMapping[key];
                // NOTE: we are comparing hash instead of value so that this works for source language as well as other languages
                if (prevValue && prevValue.hash !== hash) {
                    // throw `Add: We already have string with different value for namespace '${action.namespace}' and key '${action.key}'`;
                    console.warn( `Add: We already have string with different value for namespace '${action.namespace}' and key '${action.key}'`);
                    return;
                }

                if (newMapping[key]) {
                    // throw `Add: We already have string for namespace '${action.namespace}' and key '${action.key}' in migration`;
                    console.warn(`Add: We already have string for namespace '${action.namespace}' and key '${action.key}' in migration`);
                    return;
                }

                newMapping[key] = {
                    page_name: action.namespace,
                    key: action.key,
                    language,
                    value: isSourceLanguage
                        ? action.value
                        : '',
                    hash,
                };
            } else if (action.action === 'remove') {
                // NOTE: We can add or move string so we might have value in newMapping
                if (!newMapping[key]) {
                    newMapping[key] = null;
                }
            } else {
                const prevValue = stringsMapping[key];
                if (isSourceLanguage && !prevValue) {
                    // throw `Update: We do not have string with namespace '${action.namespace}' and key '${action.key}'`;
                    console.warn(`Update: We do not have string with namespace '${action.namespace}' and key '${action.key}'`);
                    return;
                }

                const prevValueFromServer = stringsMappingFromServer[key] ?? prevValue;
                if (!isSourceLanguage && !prevValueFromServer) {
                    return;
                }

                const newKey = action.newKey ?? action.key;
                const newNamespace = action.newNamespace ?? action.namespace;
                const newValue = isSourceLanguage
                    ? (action.newValue ?? prevValue.value)
                    : prevValueFromServer.value;
                const newHash = isSourceLanguage
                    ? Md5.hashStr(newValue)
                    : prevValueFromServer.hash;

                const newCanonicalKey = `${newNamespace}:${newKey}:${language}`;

                // NOTE: remove the old key and add new key
                if (!newMapping[key]) {
                    newMapping[key] = null;
                }

                const newItem = {
                    page_name: newNamespace,
                    key: newKey,
                    language,
                    value: newValue,
                    hash: newHash,
                }

                if (newMapping[newCanonicalKey]) {
                    // throw `Update: We already have string for namespace '${action.namespace}' and key '${action.key}' in migration`;
                    console.warn( `Update: We already have string for namespace '${action.namespace}' and key '${action.key}' in migration`);
                    return;
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
    projectPath: string,
    sourceFileNames: string[],
    destinationFileName: string,
    migrationFilePath: string,
    languages: string[],
    dryRun: boolean | undefined,
) {

    // FIXME: We can use multiple source path
    const sourcePaths = sourceFileNames.map((sourceFileName) => (
        isAbsolute(sourceFileName)
            ? sourceFileName
            : join(projectPath, sourceFileName)
    ));
    const sourceFiles = await Promise.all(sourcePaths.map(
        (sourcePath) => readSource(sourcePath),
    ))

    const migrationFilesAttrs = await getMigrationFilesAttrs(projectPath, migrationFilePath);
    const selectedMigrationFilesAttrs = migrationFilesAttrs;

    console.info(`Found ${selectedMigrationFilesAttrs.length} migration files`);

    if (selectedMigrationFilesAttrs.length < 1) {
        throw 'There should be atleast 1 migration file';
    }

    const selectedMigrations = await readMigrations(
        selectedMigrationFilesAttrs.map((migration) => migration.fileName),
    );

   let outputSourceFileContent: SourceFileContent = [];
   selectedMigrations.forEach((migration) => {
       outputSourceFileContent = apply(
           outputSourceFileContent,
           sourceFiles.flatMap((sourceFile) => sourceFile.content),
           migration.content.actions,
           languages,
       );
   });

   outputSourceFileContent = [...outputSourceFileContent].sort((foo, bar) => (
        foo.page_name.localeCompare(bar.page_name)
        || foo.key.localeCompare(bar.key)
        || foo.language.localeCompare(bar.language)
   ));

   outputSourceFileContent = outputSourceFileContent.sort((foo, bar) => (
        foo.page_name.localeCompare(bar.page_name)
        || foo.key.localeCompare(bar.key)
        || foo.language.localeCompare(bar.language)
   ));

    const destinationPath = isAbsolute(destinationFileName)
        ? destinationFileName
        : join(projectPath, destinationFileName)

    if (dryRun) {
        console.info(`Creating file '${destinationPath}'`);
        console.info(outputSourceFileContent);
    } else {
        await writeFilePromisify(
            destinationPath,
            JSON.stringify(outputSourceFileContent, null, 4),
            'utf8',
        );
    }
}

export default applyMigrations;
