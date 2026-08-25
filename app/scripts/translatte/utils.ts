import { join, isAbsolute, basename } from 'path';
import { promisify } from 'util';
import { readFile, writeFile, unlink } from 'fs';
import glob from 'fast-glob';
import { CellValue, Row } from 'exceljs';
import {
    encodeDate,
    isDefined,
    isFalsyString,
    isNotDefined,
    intersection,
    listToMap,
    mapToList,
    unique,
    difference,
} from '@togglecorp/fujs';

import {
    TranslationFileContent,
    MigrationFileContent,
    SourceFileContent,
    Language,
    ServerActionItem,
    SourceStringItem,
    MigrationActionItem,
} from './types';

const readFilePromisify = promisify(readFile);
export const writeFilePromisify = promisify(writeFile);
const unlinkPromisify = promisify(unlink);

// Utilities

export function resolveUrl(base: string, endpoint: string): string {
    // If endpoint is already an absolute URL, return it as-is
    if (/^https?:\/\//i.test(endpoint)) {
        return endpoint;
    }

    // Ensure base ends with a slash
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;

    // Remove leading slash from endpoint to avoid URL() resetting the path
    const normalizedEndpoint = endpoint.startsWith('/')
        ? endpoint.slice(1)
        : endpoint;

    return new URL(normalizedEndpoint, normalizedBase).toString();
}

function resolveCellValue(cellValue: CellValue): string | number | boolean | undefined {
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

export function getCellValueFromRow(row: Row, columnIndex: number | undefined) {
    if (isNotDefined(row) || isNotDefined(columnIndex)) {
        return undefined;
    }

    const cellValue = row.getCell(columnIndex).value;

    return getStringValueFromCellValue(cellValue);
}

async function fetchLanguageStrings(language: Language, apiUrl: string, authToken?: string) {
    const endpoint = resolveUrl(apiUrl, `${language}/`);
    const headers: RequestInit['headers'] = {
        'Accept': 'application/json'
    }

    if (isDefined(authToken)) {
        headers['Authorization'] =  `Token ${authToken}`;
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

export async function postLanguageStrings(language: Language, actions: ServerActionItem[], apiUrl: string, authToken: string) {
    const endpoint = resolveUrl(apiUrl, language);
    const bulkActionEndpoint = resolveUrl(`${endpoint}/`, 'bulk-action/');

    const promise = fetch(
        bulkActionEndpoint,
        {
            method: 'POST',
            headers: {
                'Authorization': `Token ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ actions }),
        }
    );

    return promise;
}

export function oneOneMapping<T, K extends string | number>(
    prevState: T[],
    currentState: T[],
    keySelector: (item: T) => K,
    validate: (prevStateItem: T, currentStateItem: T) => boolean,
) {
    const prevStateMapping = listToMap(
        prevState,
        keySelector,
        (item) => item,
    );
    const currentStateMapping = listToMap(
        currentState,
        keySelector,
        (item) => item,
    );

    const prevStateKeySet = new Set(
        Object.keys(prevStateMapping) as Array<keyof typeof prevStateMapping>
    );
    const currentStateKeySet = new Set(
        Object.keys(currentStateMapping) as Array<keyof typeof currentStateMapping>,
    );

    const commonKeySet = intersection(prevStateKeySet, currentStateKeySet);
    const prevStateExclusiveKeySet = difference(prevStateKeySet, commonKeySet);
    const currentStateExclusiveKeySet = difference(currentStateKeySet, commonKeySet);

    const commonItems = [...commonKeySet].map(
        (key) => ({
            key,
            prevStateItem: prevStateMapping[key],
            currentStateItem: currentStateMapping[key],
        })
    )

    const commonItemsMap = listToMap(
        commonItems,
        ({ key }) => key,
    );

    const validCommonItems = commonItems.filter(
        ({ prevStateItem, currentStateItem }) => validate(prevStateItem, currentStateItem)
    );

    const validCommonItemsKeySet = new Set(
        validCommonItems.map(({ key }) => key)
    );

    const invalidCommonItemsKeySet = difference(commonKeySet, validCommonItemsKeySet);
    const invalidCommonItems = Array.from(invalidCommonItemsKeySet).map(
        (key) => commonItemsMap[key],
    );

    return {
        validCommonItems,
        invalidCommonItems,
        prevStateRemainder: Array.from(prevStateExclusiveKeySet).map((key) => prevStateMapping[key]),
        currentStateRemainder: Array.from(currentStateExclusiveKeySet).map((key) => currentStateMapping[key]),
    };
}

export function oneOneMappingNonUnique<T, K extends string | number>(
    prevState: T[],
    currentState: T[],
    keySelector: (item: T) => K,
) {
    const prevStateWithKey = prevState.map(
        (item) => {
            const key = keySelector(item);

            return {
                key,
                item,
            };
        }
    );

    const currentStateWithKey = currentState.map(
        (item) => {
            const key = keySelector(item);

            return {
                key,
                item,
            };
        }
    );

    const {
        commonItems,
        prevStateRemainder,
        currentStateRemainder,
    } = prevStateWithKey.reduce(
        (acc, prevStateItem) => {
            const matchIndex = acc.currentStateRemainder.findIndex(
                ({ key }) => prevStateItem.key === key,
            )

            if (matchIndex === -1) {
                return acc;
            }

            const prevStateMatchIndex = acc.prevStateRemainder.findIndex(
                ({ key }) => prevStateItem.key === key,
            );

            if (prevStateMatchIndex === -1) {
                return acc;
            }

            return {
                commonItems: [
                    ...acc.commonItems,
                    {
                        prevStateItem: prevStateItem,
                        currentStateItem: acc.currentStateRemainder[matchIndex],
                    },
                ],
                prevStateRemainder: [
                    ...acc.prevStateRemainder.slice(0, prevStateMatchIndex),
                    ...acc.prevStateRemainder.slice(prevStateMatchIndex + 1),
                ],
                currentStateRemainder: [
                    ...acc.currentStateRemainder.slice(0, matchIndex),
                    ...acc.currentStateRemainder.slice(matchIndex + 1),
                ],
            }
        },
        {
            prevStateRemainder: [...prevStateWithKey],
            commonItems: [] as {
                prevStateItem: { key: K, item: T },
                currentStateItem: { key: K, item: T },
            }[],
            currentStateRemainder: [...currentStateWithKey],
        },
    );

    return {
        commonItems: commonItems.map(
            ({ prevStateItem, currentStateItem }) => ({
                prevStateItem: prevStateItem.item,
                currentStateItem: currentStateItem.item,
            })
        ),
        prevStateRemainder: prevStateRemainder.map(
            ({ item }) => item,
        ),
        currentStateRemainder: currentStateRemainder.map(
            ({ item }) => item,
        ),
    };
}

export function getDuplicateItems<T>(
    list: T[],
    keySelector: (value: T) => string,
) {
    if (!list) {
        return [];
    }
    const counts = listToMap<T, number, string>(
        list,
        keySelector,
        (_, key, __, acc) => {
            const value = acc[key];
            return isDefined(value) ? value + 1 : 1;
        },
    );

    return list
        .filter((item) => counts[keySelector(item)] > 1)
        .sort((foo, bar) => keySelector(foo).localeCompare(keySelector(bar)));
}

function concat(...args: string[]) {
    return args.join(":");
}

function removeUndefinedKeys<T extends object>(itemFromArgs: T) {
    const item = {...itemFromArgs};
    Object.keys(item).forEach(key => {
        if (item[key as keyof T] === undefined) {
            delete item[key as keyof T];
        }
    });
    return item;
}

export async function getMigrationFilesAttrs(basePath: string, pathName: string) {
    const fullPath = isAbsolute(pathName)
        ? join(pathName, '[0-9]+-[0-9]+.json')
        : join(basePath, pathName, '[0-9]+-[0-9]+.json')

    const files = await glob(fullPath, { ignore: ['node_modules'], absolute: true });

    interface MigrationFileAttrs {
        migrationFileName: string;
        migrationName: string;
        filePath: string;
        num: string;
        timestamp: string;
    }

    const migrationFiles = files
        .map((file): MigrationFileAttrs | undefined => {
            const migrationFileName = basename(file);
            const attrs = migrationFileName.match(/(?<num>[0-9]+)-(?<timestamp>[0-9]+)/)?.groups as (
                Pick<MigrationFileAttrs, 'num' | 'timestamp'> | undefined
            );
            if (attrs) {
                return {
                    ...attrs,
                    migrationName: `${attrs.num}-${attrs.timestamp}`,
                    migrationFileName,
                    filePath: file,
                }
            }
            return undefined;
        })
        .filter(isDefined)
        .sort((a, b) => a.migrationFileName.localeCompare(b.migrationFileName));
    return migrationFiles;
}

export async function getTranslationFileNames(basePath: string, pathNames: string[]) {
    const fullPathNames = pathNames.map((pathName) => (
        isAbsolute(pathName)
            ? pathName
            : join(basePath, pathName)
    ));

    const fileNamesPromise = fullPathNames.map(async (fullPathName) => {
        return glob(fullPathName, { ignore: ['node_modules'], absolute: true });
    });
    const fileNames = (await Promise.all(fileNamesPromise)).flat();
    return unique(fileNames);
}

export async function readJsonFilesContents(fileNames: string[]) {
    const contentsPromise = fileNames.map(async (fileName) => {
        const fileDescriptor = await readFilePromisify(fileName);
        try {
            const content = JSON.parse(fileDescriptor.toString());
            return {
                file: fileName,
                content,
            };
        } catch {
            throw `Error while parsing JSON for ${fileName}}`;
        }
    });
    const contents = await Promise.all(contentsPromise);
    return contents;
}

export async function readTranslations(fileNames: string[]) {
    const filesContents = await readJsonFilesContents(fileNames);

    const translations = filesContents.flatMap((fileContent) => {
        // TODO: validate the schema for content
        const {
            file,
            content,
        } = fileContent as {
            file: string,
            content: TranslationFileContent,
        };

        return mapToList(
            content.strings,
            (item, key) => ({
                file,
                namespace: content.namespace,
                key,
                value: item,
            }),
        );
    });

    return { translations, filesContents };
}

export async function readMigrations(fileNames: string[]) {
    const fileContents = await readJsonFilesContents(fileNames);
    // TODO: validate the schema for content
    return fileContents as { file: string, content: MigrationFileContent }[];
}

export async function readSource(fileName: string) {
    const fileContents = await readJsonFilesContents([fileName]);
    // TODO: validate the schema for content
    return fileContents[0] as {
        file: string, content: SourceFileContent
    };
}

export async function removeFiles(files: string[]) {
    const removePromises = files.map(async (file) => (
        unlinkPromisify(file)
    ));
    await Promise.all(removePromises);
}

export const languages: Language[] = ['en', 'fr', 'es', 'ar'];

export async function fetchServerState(apiUrl: string, authToken?: string) {
    const responsePromises = languages.map(
        (language) => fetchLanguageStrings(language, apiUrl, authToken)
    );

    const responses = await Promise.all(responsePromises);

    const languageJsonPromises = responses.map(
        (response) => response.json()
    );

    const languageStrings = await Promise.all(languageJsonPromises);

    const serverStrings = languageStrings.flatMap(
        (languageString) => {
            const language: Language = languageString.code;

            const strings: SourceStringItem[] = languageString.strings.map(
                (string: Omit<SourceStringItem, 'language'>) => ({
                    ...string,
                    language,
                })
            )

            return strings;
        }
    );

    return serverStrings;
}

function getCanonicalKey(
    item: MigrationActionItem,
    opts: { useNewKey: boolean },
) {
    if (opts.useNewKey && item.action === 'update') {
        return concat(
            item.newNamespace ?? item.namespace,
            item.newKey ?? item.key,
        );
    }
    return concat(
        item.namespace,
        item.key,
    );
}

export function mergeMigrationActionItems(
    prevMigrationActionItems: MigrationActionItem[],
    nextMigrationActionItems: MigrationActionItem[],
) {
    interface PrevMappings {
        [key: string]: MigrationActionItem,
    }

    const prevCanonicalKeyMappings: PrevMappings = listToMap(
        prevMigrationActionItems,
        (item) => getCanonicalKey(item, { useNewKey: true }),
        (item) => item,
    );

    interface NextMappings {
        [key: string]: MigrationActionItem | null,
    }

    const nextMappings = nextMigrationActionItems.reduce<NextMappings>(
        (acc, nextMigrationActionItem) => {
            const canonicalKey = getCanonicalKey(nextMigrationActionItem, { useNewKey: false })

            const prevItemWithCanonicalKey = prevCanonicalKeyMappings[canonicalKey];
            // const prevItemWithKey = prevKeyMappings[nextMigrationActionItem.key];

            if (!prevItemWithCanonicalKey) {
                return {
                    ...acc,
                    [canonicalKey]: nextMigrationActionItem,
                };
            }

            if (prevItemWithCanonicalKey.action === 'add' && nextMigrationActionItem.action === 'add') {
                throw `Action 'add' already exists for '${canonicalKey}'`;
            }
            if (prevItemWithCanonicalKey.action === 'add' && nextMigrationActionItem.action === 'remove') {
                return {
                    ...acc,
                    [canonicalKey]: null,
                };
            }
            if (prevItemWithCanonicalKey.action === 'add' && nextMigrationActionItem.action === 'update') {
                const newKey = nextMigrationActionItem.newKey
                    ?? prevItemWithCanonicalKey.key;
                const newNamespace = nextMigrationActionItem.newNamespace
                    ?? prevItemWithCanonicalKey.namespace;

                const newMigrationItem = removeUndefinedKeys<MigrationActionItem>({
                    action: 'add',
                    namespace: newNamespace,
                    key: newKey,
                    value: nextMigrationActionItem.newValue
                        ?? prevItemWithCanonicalKey.value,
                });

                const newCanonicalKey = getCanonicalKey(newMigrationItem, { useNewKey: true });
                if (acc[newCanonicalKey] !== undefined && acc[newCanonicalKey] !== null) {
                    throw `Action 'update' cannot be applied to '${newCanonicalKey}' as the key already exists`;
                }

                return {
                    ...acc,
                    // Setting null so that we remove them on the mappings.
                    // No need to set null, if we have already overridden with other value
                    [canonicalKey]: acc[canonicalKey] === undefined || acc[canonicalKey] === null
                            ? null
                            : acc[canonicalKey],
                    [newCanonicalKey]: newMigrationItem,
                }
            }
            if (prevItemWithCanonicalKey.action === 'remove' && nextMigrationActionItem.action === 'add') {
                return {
                    ...acc,
                    [canonicalKey]: removeUndefinedKeys<MigrationActionItem>({
                        action: 'update',
                        namespace: prevItemWithCanonicalKey.namespace,
                        key: prevItemWithCanonicalKey.key,
                        newValue: nextMigrationActionItem.value,
                    })
                };
            }
            if (prevItemWithCanonicalKey.action === 'remove' && nextMigrationActionItem.action === 'remove') {
                // pass
                return acc;
            }
            if (prevItemWithCanonicalKey.action === 'remove' && nextMigrationActionItem.action === 'update') {
                throw `Action 'update' cannot be applied to '${canonicalKey}' after action 'remove'`;
            }
            if (prevItemWithCanonicalKey.action === 'update' && nextMigrationActionItem.action === 'add') {
                throw `Action 'add' cannot be applied to '${canonicalKey}' after action 'update'`;
            }
            if (prevItemWithCanonicalKey.action === 'update' && nextMigrationActionItem.action === 'update') {
                return {
                    ...acc,
                    [canonicalKey]: removeUndefinedKeys<MigrationActionItem>({
                        action: 'update',
                        namespace: prevItemWithCanonicalKey.namespace,
                        key: prevItemWithCanonicalKey.key,
                        newNamespace: nextMigrationActionItem.newNamespace ?? prevItemWithCanonicalKey.newNamespace,
                        newKey: nextMigrationActionItem.newKey ?? prevItemWithCanonicalKey.newKey,
                        newValue: nextMigrationActionItem.newValue ?? prevItemWithCanonicalKey.newValue,
                    }),
                };
            }
            if (prevItemWithCanonicalKey.action === 'update' && nextMigrationActionItem.action === 'remove') {
                return {
                    ...acc,
                    [canonicalKey]: removeUndefinedKeys<MigrationActionItem>({
                        action: 'remove',
                        namespace: prevItemWithCanonicalKey.namespace,
                        key: prevItemWithCanonicalKey.key,
                    }),
                };
            }
            return acc;
        },
        {},
    );

    const finalMappings = {
        ...prevCanonicalKeyMappings,
        ...nextMappings,
    };

    return Object.values(finalMappings).filter(isDefined);
}
