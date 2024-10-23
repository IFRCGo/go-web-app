import { join, isAbsolute, basename } from 'path';
import fg from 'fast-glob';
import { promisify } from 'util';
import { readFile, writeFile, unlink } from 'fs';
import {
    isDefined,
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
} from './types';

export const readFilePromisify = promisify(readFile);
export const writeFilePromisify = promisify(writeFile);
export const unlinkPromisify = promisify(unlink);
export const glob = fg.glob;

// Utilities

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
        prevStateRemainder: [
            ...Array.from(prevStateExclusiveKeySet).map((key) => prevStateMapping[key]),
            // ...Array.from(invalidCommonItemsKeySet).map((key) => prevStateMapping[key]),
        ],
        currentStateRemainder: [
            ...Array.from(currentStateExclusiveKeySet).map((key) => currentStateMapping[key]),
            // ...Array.from(invalidCommonItemsKeySet).map((key) => currentStateMapping[key]),
        ],
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

export function concat(...args: string[]) {
    return args.join(":");
}

export function removeUndefinedKeys<T extends object>(itemFromArgs: T) {
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
        migrationName: string;
        fileName: string;
        num: string;
        timestamp: string;
    }

    const migrationFiles = files
        .map((file): MigrationFileAttrs | undefined => {
            const migrationName = basename(file);
            const attrs = migrationName.match(/(?<num>[0-9]+)-(?<timestamp>[0-9]+)/)?.groups as (Omit<MigrationFileAttrs, 'filename'> | undefined)
            if (attrs) {
                return {
                    ...attrs,
                    migrationName,
                    fileName: file,
                }
            }
            return undefined;
        })
        .filter(isDefined)
        .sort((a, b) => a.migrationName.localeCompare(b.migrationName));
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
        } catch (e) {
            throw `Error while parsing JSON for ${fileName}`;
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

    const metadata = filesContents.map((fileContent) => {
        // TODO: validate the schema for content
        const {
            file,
            content,
        } = fileContent as {
            file: string,
            content: TranslationFileContent,
        };
        return {
            fileName: file,
            namespace: content.namespace,
        };
    });

    return { translations, metadata };
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
