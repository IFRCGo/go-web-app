import { join, isAbsolute } from 'path';
import fg from 'fast-glob';
import {
    mapToList,
    unique,
} from '@togglecorp/fujs';
import { promisify } from 'util';
import { readFile } from 'fs';
import { Md5 } from 'ts-md5';

export const readFilePromisify = promisify(readFile);
export const glob = fg.glob;

const projectPath = '.';
const translationFileName = ['**/i18n.json'];

interface TranslationFileContent {
    namespace: string,
    strings: {
        [key: string]: string,
    },
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
        const {
            // file,
            content,
        } = fileContent as {
            file: string,
            content: TranslationFileContent,
        };

        return mapToList(
            content.strings,
            (item, key) => ({
                page_name: content.namespace,
                key,
                language: 'en',
                value: item,
                hash: Md5.hashStr(item),
            }),
        );
    });
    return translations;
}


const fileNames = await getTranslationFileNames(projectPath, translationFileName);
const translations = await readTranslations(fileNames);

console.log(JSON.stringify(translations.sort((a, b) => (
    a.page_name.localeCompare(b.page_name)
    || a.key.localeCompare(b.key)
)), null, 2));
