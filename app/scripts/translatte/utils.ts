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
    foo: T[],
    bar: T[],
    keySelector: (item: T) => K,
    validate: (foo: T, bar: T) => boolean,
) {
    const fooKeys = new Set(foo.map(keySelector));
    const barKeys = new Set(bar.map(keySelector));

    const commonKeys = intersection(fooKeys, barKeys);

    const fooMapping = listToMap(
        foo,
        keySelector,
        (item) => item,
    );
    const barMapping = listToMap(
        bar,
        keySelector,
        (item) => item,
    );

    const match = [...commonKeys].map((key): [T, T] => ([
        fooMapping[key],
        barMapping[key],
    ]))

    const validMatch = match.filter(([fooItem, barItem]) => validate(fooItem, barItem));
    const invalidMatch = match.filter(([fooItem, barItem]) => !validate(fooItem, barItem));

    return {
        match: validMatch,
        leftRemainder: [
            ...foo.filter((item) => !commonKeys.has(keySelector(item))),
            ...invalidMatch.map(([fooItem]) => fooItem),
        ],
        rightRemainder: [
            ...bar.filter((item) => !commonKeys.has(keySelector(item))),
            ...invalidMatch.map(([_, barItem]) => barItem),
        ],
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
    return translations;
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
